import arcpy
import os

class Toolbox(object):
    def __init__(self):
        self.label = "Custom Tools"
        self.alias = "customtools"
        self.tools = [CalculateArea]

class CalculateArea(object):
    def __init__(self):
        self.label = "Calculate Polygon Area"
        self.description = "Adds a new field to a polygon feature class and calculates its area in square meters."
        self.canRunInBackground = False

    def getParameterInfo(self):
        params = []

        # Input polygon feature class
        in_fc = arcpy.Parameter(
            displayName="Input Polygon Feature Class",
            name="input_fc",
            datatype="DEFeatureClass",
            parameterType="Required",
            direction="Input"
        )

        # Field name to create
        field_name = arcpy.Parameter(
            displayName="Field Name",
            name="field_name",
            datatype="GPString",
            parameterType="Optional",
            direction="Input"
        )
        field_name.value = "Area_m2"

        params.append(in_fc)
        params.append(field_name)
        return params

    def execute(self, parameters, messages):
        input_fc = parameters[0].valueAsText
        field_name = parameters[1].valueAsText

        add_area_field(input_fc, field_name)
        messages.addMessage(f"Area calculated and stored in field: {field_name}")


def buffer_features(
    input_fc: str,
    output_gdb: str,
    buffer_distance: str
) -> None:
    """
    Creates a buffer around all features in the input feature class.

    Parameters:
        input_fc (str): Path to the input feature class (e.g. shapefile or feature class).
        output_gdb (str): Path to an existing geodatabase where output will be saved.
        buffer_distance (str): Distance for the buffer (e.g. "500 meters" or "1 mile").
    """
    try:
        # Make sure output geodatabase exists
        if not arcpy.Exists(output_gdb):
            raise FileNotFoundError(f"Output geodatabase not found: {output_gdb}")

        # Derive output feature class name
        base_name: str = os.path.splitext(os.path.basename(input_fc))[0]
        output_fc: str = os.path.join(output_gdb, f"{base_name}_buffer")

        # Run Buffer analysis
        arcpy.Buffer_analysis(
            in_features=input_fc,
            out_feature_class=output_fc,
            buffer_distance_or_field=buffer_distance,
            line_side="FULL",
            line_end_type="ROUND",
            dissolve_option="ALL"
        )

        print(f"Buffer created successfully at: {output_fc}")

    except Exception as e:
        arcpy.AddError(str(e))
        print(f"Error: {e}")


def add_area_field(input_fc: str, field_name: str = "Area_m2") -> None:
    # Add field if it doesn't exist
    existing_fields = [f.name for f in arcpy.ListFields(input_fc)]
    if field_name not in existing_fields:
        arcpy.AddField_management(input_fc, field_name, "DOUBLE")

    # Calculate area using geometry
    with arcpy.da.UpdateCursor(input_fc, [field_name, "SHAPE@AREA"]) as cursor:
        for row in cursor:
            row[0] = row[1]  # Assign area to field
            cursor.updateRow(row)

    print(f"Area values calculated and stored in '{field_name}'.")
