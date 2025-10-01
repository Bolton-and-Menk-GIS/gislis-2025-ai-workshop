import { shallowRef, ref, watch } from 'vue'
import { log, buildSurveyFeatures, getSectionCornerPoint } from '@/utils';
import type {
  SurveyInfo
} from '@/typings'
import { arcgisToGeoJSON } from "@terraformer/arcgis"
// @ts-expect-error // no types available
import { download } from '@crmackey/shp-write'
import { surveyLayerProperties, cogoLayerProperties, tiePointLayerProperties } from '@/templates'
import * as unionOperator from '@arcgis/core/geometry/operators/unionOperator'
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'


interface PLSSFields {
  /**
   * first division (Townships) field name
   * @default "FFRSTDIVNO"
   */
  firstDivision: string;
  /**
   * the township label field
   * @default "TWNSHPLAB"
   */
  townshipLabel: string;
  /**
   * the quarter section field
   * @default "QSEC"
   */
  quarterSection: string;
}
interface usePLSSLayersOptions {
  view: __esri.MapView;
  fortysLayerName?: string;
  townshipsLayerName?: string;
  sectionsLayerName?: string;
  /**
   * field mappings for PLSS fields
   */
  fields?: PLSSFields;
}

const defaultPLSSFields: PLSSFields = {
  firstDivision: 'FRSTDIVNO',
  townshipLabel: 'TWNSHPLAB',
  quarterSection: 'QSEC',
}

export const getLayerView = (view: __esri.MapView, lyr: __esri.FeatureLayer): __esri.FeatureLayerView | undefined => {
  return view.allLayerViews.find(lv => lv.layer.id === lyr.id) as __esri.FeatureLayerView
}

export const usePLSSLayers = (options: usePLSSLayersOptions) => {
  const {
    view,
    fortysLayerName = "PLSS Intersected",
    townshipsLayerName = "PLSS Township",
    sectionsLayerName = "PLSS First Division",
    fields = defaultPLSSFields
  } = options

  const map = view.map!

  const highlightHandle = ref<IHandle>()

  const currentTownshipFeature = shallowRef<__esri.Graphic>()
  const currentSectionFeature = shallowRef<__esri.Graphic>()

  const fortysLayer = shallowRef(
    map.allLayers.find(l => l.title === fortysLayerName) as __esri.FeatureLayer
  )
  const townshipsLayer = shallowRef(
    map.allLayers.find(l => l.title === townshipsLayerName) as __esri.FeatureLayer
  )
  const sectionsLayer = shallowRef(
    map.allLayers.find(l => l.title === sectionsLayerName) as __esri.FeatureLayer
  )

  // set up drawing layers
  const boundaryLayer = new FeatureLayer(surveyLayerProperties)
  const cogoLayer = new FeatureLayer(cogoLayerProperties)
  const tiePointLayer = new FeatureLayer(tiePointLayerProperties)

  // add boundary layer to the map
  view.map?.addMany([cogoLayer, boundaryLayer, tiePointLayer])

  // ensure all layers have outFields set to "*" so all fields are fetched in queries
  watch([fortysLayer, townshipsLayer, sectionsLayer], 
    (layers)=> {
      layers.forEach(lyr => {
        lyr?.load()?.then(()=> {
          lyr.outFields = ['*']
          if (lyr.popupTemplate){
            lyr.popupTemplate.outFields = ['*']
          }
          log(`[plss]: set outFields for "${lyr.title}"`)
          if (lyr.title === townshipsLayerName){
            // zoom level 10
            lyr.minScale = 577790.554289 
          }
        })
      })
    },
    { immediate: true }
  )

  const unHighlight = () => {
    if (highlightHandle.value) {
      highlightHandle.value.remove()
    }
    highlightHandle.value = undefined
  }

  const highlight = (lv?: __esri.FeatureLayerView, target?: __esri.Graphic | __esri.Graphic[] | number | number[]) => {
    unHighlight()
    if (target){
      highlightHandle.value = lv?.highlight(target)
    }
  }
  
  async function createSurveyBoundary(survey: SurveyInfo){
    if (!townshipsLayer.value || !sectionsLayer.value || !fortysLayer.value){
      console.warn('could not access necessary PLSS layers')
      return
    }

    const twp = `${survey.township}${survey.townshipDirection}`
    const rng = `${survey.range}${survey.rangeDirection}`
    const twpLabel = `${twp} ${rng}`
    const twpWhere = `TWNSHPLAB = '${twpLabel}'`
    // form where clause like "TWNSHPLAB = '119N 21W'"
    let twpFeature: __esri.Graphic | undefined = undefined

    if (currentTownshipFeature.value?.attributes[fields.townshipLabel] === twpLabel){
      // check if the current township boundary matches
      twpFeature = currentTownshipFeature.value
      log(`[plss]: using cached towhsnip feature: `, twpFeature)
    } else {
      // first query features using appropriate survey division level
      log(`[plss]: searching towships matching with where clause: "${twpWhere}"`)
      const { features: twpFeatures } = await townshipsLayer.value.queryFeatures({
        where: twpWhere,
        outFields: ['*'],
        returnGeometry: true,
        outSpatialReference: { wkid: 3857 }
      })
  
      twpFeature = twpFeatures[0]
      // set current township feature
      currentTownshipFeature.value = twpFeature
    }

    if (!twpFeature){
      throw new Error(`could not find township and range matching: "${twpWhere}"`)
    }
    log(`found township feature matching township and range: ${twpLabel}`)

    // next find target section
    let sectionFeature: __esri.Graphic | undefined = undefined
    const sectionWhere = `FRSTDIVNO = '${survey.section}'`

    if (currentSectionFeature.value?.attributes[fields.firstDivision] === survey.section && currentSectionFeature.value?.attributes[fields.townshipLabel] === twpLabel){
      sectionFeature = currentSectionFeature.value
      log(`[plss]: using cached section feature: `, sectionFeature)
    } else {
      // fetch section
      log(`[plss]: searching for sections in "${twpLabel}" Township with where clause: "${sectionWhere}"`)
      const { features: sectionFeatures } = await sectionsLayer.value.queryFeatures({
        where: sectionWhere,
        outFields: ['*'],
        geometry: twpFeature.geometry,
        returnGeometry: true,
        outSpatialReference: { wkid: 3857 }
      })
  
      sectionFeature = sectionFeatures[0]
      currentSectionFeature.value = sectionFeature
    }

    if (!sectionFeature){
      throw new Error(`could not find section matching: "${sectionWhere}" within township`)
    }

    if (['forty', 'quarter'].includes(survey.referencePoint.divisionLevel)){

      /**
       * for performance reasons just use geometry to query for PLSS Intersects 
       * within section (way too slow and unstable with only attribute queries)
       */
      const fortyWhere = [survey.referencePoint.referenceWhere, sectionWhere].join(' AND ') 
      log(`[plss]: finding "${survey.referencePoint.divisionLevel}" within section ${survey.section} using where: ${fortyWhere}`)
      const { features: fortyFeatures } = await fortysLayer.value.queryFeatures({
        where: fortyWhere,
        outFields: ['*'],
        geometry: sectionFeature.geometry,
        returnGeometry: true,
        outSpatialReference: { wkid: 3857 }
      })

      log(`[plss]: found ${fortyFeatures.length} features matching "${survey.referencePoint.divisionLevel}" within section "${survey.section}" using where: ${fortyWhere}: `, fortyFeatures)

      let pt: __esri.Point | undefined = undefined

      if (survey.referencePoint.divisionLevel === 'quarter'){
        // group features by QSEC attribute
        const quartersLookup: Record<string, __esri.Graphic[]> = fortyFeatures.reduce((groups, ft) => {
          const qsec = ft.attributes[fields.quarterSection]
          if (!groups[qsec]){
            groups[qsec] = []
          }
          groups[qsec].push(ft)
          return groups
        }, {} as Record<string, __esri.Graphic[]>)

        // get union of quarters from quarter-quarters
        const quarters = Object.values(quartersLookup)
          .map(fortys => unionOperator.executeMany(fortys.map(f=> f.geometry!)))
          .filter(f => !!f) as __esri.Polygon[]

        // get intersection of quarters to find starting point
        pt = getSectionCornerPoint(quarters, survey.referencePoint.corner)
      } else if (survey.referencePoint.divisionLevel === 'section'){
        // TODO: SECTION LOGIC
      }
      
      if (pt){

        log(`[plss]: intersected section quarters with to get tie point: `, pt)
        const {
          lines,
          tiePoint,
          boundaryPolygon
        } = buildSurveyFeatures(pt.longitude!, pt.latitude!, survey)
  
        log(`[plss]: built survey polygon: `, boundaryPolygon)
        log(`[plss]: cogo lines: `, lines)
        log(`[plss]: tie point: `, tiePoint)
        await boundaryLayer.applyEdits({ addFeatures: [ boundaryPolygon ] })
        await cogoLayer.applyEdits({ addFeatures: lines })
        await tiePointLayer.applyEdits({ addFeatures: [ tiePoint ] })
  
        view.goTo(boundaryPolygon)
      }
      else {
        // just zoom to section if no point could be found
        view.goTo(sectionFeature).then(()=> {
          const lv = getLayerView(view, sectionsLayer.value)
          highlight(lv, sectionFeature)
        })
      }

    }

  }

  /**
   * export the survey features as shapefiles
   */
  const exportShapefiles = async ()=> {
    const featureCollection = {
      type: 'FeatureCollection',
      features: [],
      crs: {
        type: "name",
        properties: {
          "name": "urn:ogc:def:crs:EPSG::4326"
        }
      }
    }

    const layers = [ tiePointLayer, cogoLayer, boundaryLayer ]

    const proms: Promise<__esri.FeatureSet>[] = []
    layers.forEach(l=> {
      proms.push(
        l.queryFeatures({
          returnGeometry: true,
          outFields: ['*'],
        })
      )
    })
    
    // wait for all features to be fetched
    const featureSets = await Promise.all(proms)
    featureSets.forEach(fc => 
      fc.features.forEach(ft => {
        // @ts-expect-error // fc mismatch
        featureCollection.features.push(arcgisToGeoJSON(ft, 'OBJECTID'))
      })
    )

    log(`[plss]: FeatureCollection is: `, featureCollection)
      
    // download into shapefile
    const output = await download(featureCollection, {
      name: `SuveyBoundaries_${new Date().getTime()}`,
      folder: 'types',
      types: {
        point: 'TiePoints',
        polygon: 'SurveyBoundaries',
        line: 'COGO_Lines'
      }
    })

    // create alert notification
    const alertElm = document.createElement('calcite-alert')
    alertElm.kind = 'success'
    alertElm.icon = 'file-zip'
    alertElm.open = true
    alertElm.autoClose = true
    alertElm.autoCloseDuration = 'slow'
    const titleDiv = document.createElement('div')
    titleDiv.slot = 'title'
    titleDiv.innerText = 'Download Complete'

    const messageDiv = document.createElement('div')
    messageDiv.slot = 'message'
    messageDiv.innerText = `Your survey features exported to shapefile! You may have to enable downloads in your browser to find the file.`
    alertElm.append(titleDiv, messageDiv)
    document.body.append(alertElm)
  }

  return {
    map,
    view, 
    townshipsLayer,
    sectionsLayer,
    fortysLayer,
    boundaryLayer,
    cogoLayer,
    tiePointLayer,
    currentSectionFeature,
    currentTownshipFeature,
    createSurveyBoundary,
    getLayerView,
    highlight, 
    unHighlight,
    exportShapefiles,
  }
}