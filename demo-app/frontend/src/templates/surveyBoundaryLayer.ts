
const numericFields = [
  'section',
  'township',
  'range'
]

const platFields = [
  ...numericFields,
  'townshipDirection',
  'rangeDirection',
  'quarterQuarter',
  'cornerDescription',
  'divisionLevel',
  'surveyId',
  'filename'
]

const lineIntegerFields = [
  'lineIndex',
]

const lineFloatFields = [
  'distanceFt',
  'startLongitude',
  'startLatitude',
  'endLongitude',
  'endLatitude',
]

const lineFields = [
  'bearing',
  'label',
  'filename',
  'surveyId',
  ...lineIntegerFields,
  ...lineFloatFields
]

const tiePointNumericFields = [
  ...numericFields,
  'latitude',
  'longitude',
]

const tiePointFields = [
  ...numericFields,
  'description',
  'filename',
  'surveyId',
]

const spatialReference = { wkid: 4326 }

export const surveyLayerProperties = {
  id: `survey-drawings-${new Date().getTime()}`,
  title: 'Survey Drawings',
  geometryType: 'polygon',
  objectIdField: 'OBJECTID',
  spatialReference,
  source: [],
  fields: [
    {
      name: 'OBJECTID',
      alias: 'OBJECTID',
      type: 'oid'
    },
    ...[...platFields, 'area'].map(f => 
      ({
        name: f,
        alias: f,
        type: numericFields.includes(f) ? 'integer': 'string'
      })
    ) as __esri.FieldProperties[]
  ],
  popupEnabled: true,
  renderer: {
    type: 'simple',
    symbol: {
      type: 'simple-fill',
      color: [0, 0, 0, 0], // transparent
      outline: {
        width: 1.5,
        color: [255, 255, 0]
      }
    }
  }
} as __esri.FeatureLayerProperties


export const cogoLayerProperties = {
  id: `cogo-lines-${new Date().getTime()}`,
  title: 'COGO Lines',
  geometryType: 'polyline',
  objectIdField: 'OBJECTID',
  spatialReference,
  source: [],
  fields: [
    {
      name: 'OBJECTID',
      alias: 'OBJECTID',
      type: 'oid'
    },
    ...lineFields.map(f => 
      ({
        name: f,
        alias: f,
        type: lineFloatFields.includes(f) 
          ? 'double'
            : lineIntegerFields.includes(f)
              ? 'integer'
              : 'string'
      })
    ) as __esri.FieldProperties[]
  ],
  popupEnabled: true,
  labelsVisible: true,
  labelingInfo: [
    {
      deconflictionStrategy: "none",
      repeatLabelDistance: 500,
      labelExpressionInfo: { expression: "$feature.label"},
      symbol: {
        type: 'text',
        font: { size: 11, weight: 'bold' },
        color: 'black',
        haloSize: 1,
        haloColor: 'white'
      }
    }
  ],
  renderer: {
    type: 'simple',
    symbol: {
      type: 'simple-line',
      cap: "round",
      color: [0,122,194,1],
      join: "round",
      miterLimit: 1,
      style: "long-dash-dot-dot",
      width: 3.5
    }
  }
} as __esri.FeatureLayerProperties

export const tiePointLayerProperties = {
  id: `tie-points-${new Date().getTime()}`,
  title: 'COGO Tie Points',
  geometryType: 'point',
  objectIdField: 'OBJECTID',
  spatialReference,
  source: [],
  fields: [
    {
      name: 'OBJECTID',
      alias: 'OBJECTID',
      type: 'oid'
    },
    ...tiePointFields.map(f => 
      ({
        name: f,
        alias: f,
        type: tiePointNumericFields.includes(f) ? 'integer': 'string'
      })
    ) as __esri.FieldProperties[]
  ],
  popupEnabled: true,
  renderer: {
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      color: [255, 0, 0, 1], 
      size: 12
    }
  }
} as __esri.FeatureLayerProperties