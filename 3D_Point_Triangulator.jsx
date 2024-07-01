



// -------------------Code-------------------

function pointTriangulator(thisObj) {

    // -------------------Global variables-------------------

    // About
    var name = "3D Point Triangulator";
    var version = "1.1";

    // Build UI
    var dropdownMenuSelection;

    // Misc
    var alertMessage = [];

    function buildUI(thisObj) {

        // -------------------UI-------------------

        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", name + " " + version, undefined, { resizeable: true });

        // UI elements
        res = "group\
            {\
                orientation:'column',  alignment:['fill','center'], alignChildren:['fill','fill'],\
                setupGroup: Group\
                {\
                    orientation:'column', alignChildren:['fill','center'],\
                    staticText: StaticText{text: '3D Point Triangulator', alignment:['center','center']}\
                    convertGroup: Group\
                    {\
                        orientation:'row', alignChildren:['fill','center'],\
                        convertButton: Button{text: 'Convert to'},\
                        typeDropdown: DropDownList{properties:{items:['Point Light', 'Spot Light', 'Solid', '3D Null', '3D+2D Null']}},\
                    },\
                    settingsGroup: Group\
                    {\
                        orientation:'row', alignment:['right','center'],\
                        helpButton: Button{text: '?', maximumSize:[25,25]},\
                        setupButton: Button{text: '+', maximumSize:[25,25]}\
                        deleteSetupButton: Button{text: 'x', maximumSize:[25,25]},\
                    }\
                }\
            }";

        // Add UI elements to the panel
        myPanel.grp = myPanel.add(res);
        // Refresh the panel
        myPanel.layout.layout(true);
        // Set minimal panel size
        myPanel.grp.minimumSize = myPanel.grp.size;
        // Add panel resizing function 
        myPanel.layout.resize();
        myPanel.onResizing = myPanel.onResize = function () {
            this.layout.resize();
        }

        // -------------------Buttons-------------------

        myPanel.grp.setupGroup.convertGroup.convertButton.onClick = function () {
            convertButton();
        }

        myPanel.grp.setupGroup.convertGroup.typeDropdown.selection = 0;
        dropdownMenuSelection = myPanel.grp.setupGroup.convertGroup.typeDropdown.selection.text;
        myPanel.grp.setupGroup.convertGroup.typeDropdown.onChange = function () {
            dropdownMenuSelection = myPanel.grp.setupGroup.convertGroup.typeDropdown.selection.text;
        }

        myPanel.grp.setupGroup.settingsGroup.helpButton.onClick = function () {
            alertCopy(
                'Expression: fadaaszhi (discord)\n' +
                'Script: shy_rikki (discord)\n' +
                'Source: https://github.com/eirisocherry/3d-point-triangulator'
            );
        }

        myPanel.grp.setupGroup.settingsGroup.setupButton.onClick = function () {
            positionButton();
        }

        myPanel.grp.setupGroup.settingsGroup.deleteSetupButton.onClick = function () {
            deleteSetupButton();
        }

        return myPanel;
    }

    // -------------------Buttons-------------------

    function positionButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;
        var camera = comp.activeCamera;

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (!camera) {
            alert("No active camera found.");
            return;
        }

        // -------------------Position extractor-------------------

        app.beginUndoGroup("Add position extractor");

        // Generate unique names
        var controllerName = "Extractor (Controller)";
        var newSolidName = "Extractor (Solid)";
        var count = 1;
        while (true) {
            var controllerExists = comp.layers.byName(controllerName + (count > 1 ? " " + count : ""));
            var newSolidExists = comp.layers.byName(newSolidName + (count > 1 ? " " + count : ""));

            if ((controllerExists) || (newSolidExists)) {
                count++;
            } else {
                break;
            }
        }
        controllerName += (count > 1 ? " " + count : "");
        newSolidName += (count > 1 ? " " + count : "");

        // Create a controller
        var controller = comp.layers.addSolid(
            [0.9, 0.57, 0.05],
            controllerName,
            comp.width,
            comp.height,
            1);
        controller.threeDLayer = false;
        controller.transform.opacity.setValue(0);
        controller.startTime = camera.startTime;
        controller.inPoint = camera.inPoint;
        controller.outPoint = camera.outPoint;
        controller.label = 11; // Orange
        var pointControl = controller.effect.addProperty("ADBE Point Control");
        pointControl.name = "Location";

        // Create a solid
        var newSolid = comp.layers.addSolid(
            [0.9, 0.57, 0.05],
            newSolidName,
            100,
            100,
            1);
        newSolid.threeDLayer = true;
        newSolid.transform.scale.setValue([100, 100, 100]);
        newSolid.transform.opacity.setValue(60);
        if (comp.renderer == "ADBE Advanced 3d") {
            newSolid.property("ADBE Material Options Group").property("ADBE Accepts Lights").setValue(0);
        }
        newSolid.startTime = camera.startTime;
        newSolid.inPoint = camera.inPoint;
        newSolid.outPoint = camera.outPoint;
        newSolid.label = 11; // Orange
        newSolid.transform.position.expression =
            'posterizeTime(0)\n'
            + 'var pointProperty = thisComp.layer("' + controllerName + '").effect("Location")("Point");\n'
            + '\n'
            + 'function triangulatePoint(pointProperty) {\n'
            + '    var camera = thisComp.activeCamera;\n'
            + '    var t = pointProperty.key(1).time;\n'
            + '    var origin1 = camera.transform.position.valueAtTime(t);\n'
            + '    var direction1 = camera.toWorldVec(camera.fromComp(pointProperty.key(1).value, t), t);\n'
            + '    var aPos = [0, 0, 0];\n'
            + '    \n'
            + '    for (var i = 2; i <= pointProperty.numKeys; i++) {\n'
            + '        t = pointProperty.key(i).time;\n'
            + '        origin2 = camera.transform.position.valueAtTime(t);\n'
            + '        direction2 = camera.toWorldVec(camera.fromComp(pointProperty.key(i).value, t), t);\n'
            + '        var n = cross(direction1, direction2);\n'
            + '        var n1 = cross(direction1, n);\n'
            + '        var n2 = cross(direction2, n);\n'
            + '        var q = origin2 - origin1;\n'
            + '        aPos += origin1 + dot(q, n2) / dot(direction1, n2) * direction1;\n'
            + '        aPos += origin2 + dot(-q, n1) / dot(direction2, n1) * direction2;\n'
            + '        origin1 = origin2;\n'
            + '        direction1 = direction2;\n'
            + '    }\n'
            + '\n'
            + '    return aPos / (2 * (pointProperty.numKeys - 1));\n'
            + '}\n'
            + '\n'
            + 'if (pointProperty.numKeys > 1) {\n'
            + '    triangulatePoint(pointProperty)\n'
            + '} else {\n'
            + '    [0, 0, 0]\n'
            + '}\n';


        deselectAll(comp);
        pointControl.selected = true;
        app.endUndoGroup();
    }

    function convertButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;
        var mainLayer = comp.selectedLayers[0];

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (!comp.activeCamera) {
            alert("No active camera found.");
            return;
        }

        if (comp.selectedLayers.length !== 1 || mainLayer.name.indexOf("Extractor (Controller)") === -1) {
            alert("Select a single 'Extractor (Controller)' to convert the projected solid.");
            return;
        }

        // -------------------Convert-------------------

        app.project.save();

        app.beginUndoGroup("Convert");

        var mainLayerName = mainLayer.name;
        var count = mainLayerName.slice(23);
        var projectedLayerName = "Extractor (Solid)" + (count > 1 ? " " + count : "");
        var projectionLayer = comp.layer(projectedLayerName);
        if (!projectionLayer) {
            alert("'" + projectedLayerName + "' not found. Please, make a new setup.");
            return;
        }
        var projectedPositionValue = projectionLayer.transform.position.valueAtTime(comp.time, false);
        var projectedOrientationValue = projectionLayer.transform.orientation.valueAtTime(comp.time, false);
        var projectedScaleValue = projectionLayer.transform.scale.valueAtTime(comp.time, false);
        var projectedOpacityValue = projectionLayer.transform.opacity.valueAtTime(comp.time, false);
        var projectedLayerWidth = projectionLayer.width;
        var projectedLayerHeight = projectionLayer.height;
        if (comp.renderer == "ADBE Advanced 3d") {
            var projectedAcceptsLights = projectionLayer.property("ADBE Material Options Group").property("ADBE Accepts Lights").value;
        }

        switch (dropdownMenuSelection) {
            case 'Point Light':
                var newLightName = uniqueIndex(comp, "Point Light");
                var newLight = comp.layers.addLight(newLightName, [comp.width / 2, comp.height / 2]);
                newLight.lightType = LightType.POINT;
                newLight.lightOption.intensity.setValue(100);
                newLight.lightOption.color.setValue([getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)]);
                newLight.transform.position.setValue(projectedPositionValue);
                newLight.startTime = mainLayer.startTime;
                newLight.inPoint = mainLayer.inPoint;
                newLight.outPoint = mainLayer.outPoint;
                deselectAll(comp);
                newLight.selected = true;
                break;

            case 'Spot Light':
                var newLightName = uniqueIndex(comp, "Spot Light");
                var newLight = comp.layers.addLight(newLightName, [comp.width / 2, comp.height / 2]);
                newLight.lightType = LightType.SPOT;
                newLight.lightOption.intensity.setValue(100);
                newLight.lightOption.color.setValue([getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)]);
                newLight.transform.position.setValue(projectedPositionValue);
                newLight.transform.pointOfInterest.setValue([0, 200, 0]);
                newLight.transform.pointOfInterest.expression =
                    "var position = transform.position;\n" +
                    "[position[0]+value[0], position[1]+value[1], position[2]+value[2]];";
                newLight.startTime = mainLayer.startTime;
                newLight.inPoint = mainLayer.inPoint;
                newLight.outPoint = mainLayer.outPoint;
                deselectAll(comp);
                newLight.selected = true;
                break;

            case 'Solid':
                var newSolidColor = [getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)];
                var newSolidName = uniqueIndex(comp, "Solid");
                var newSolid = comp.layers.addSolid(
                    newSolidColor,
                    newSolidName,
                    projectedLayerWidth,
                    projectedLayerHeight,
                    1
                );
                newSolid.threeDLayer = true;
                newSolid.transform.position.setValue(projectedPositionValue);
                newSolid.transform.orientation.setValue(projectedOrientationValue);
                newSolid.transform.scale.setValue(projectedScaleValue);
                newSolid.transform.opacity.setValue(projectedOpacityValue);
                if (comp.renderer == "ADBE Advanced 3d") {
                    newSolid.property("ADBE Material Options Group").property("ADBE Accepts Lights").setValue(projectedAcceptsLights);
                }
                newSolid.startTime = mainLayer.startTime;
                newSolid.inPoint = mainLayer.inPoint;
                newSolid.outPoint = mainLayer.outPoint;
                deselectAll(comp);
                newSolid.selected = true;
                break;

            case '3D Null':
                var new3dNullName = uniqueIndex(comp, "3D Null");
                var new3dNull = comp.layers.addNull(comp.width);
                new3dNull.name = new3dNullName;
                new3dNull.threeDLayer = true;
                new3dNull.transform.position.setValue(projectedPositionValue);
                new3dNull.transform.orientation.setValue(projectedOrientationValue);
                new3dNull.transform.scale.setValue([100, 100, 100]);
                new3dNull.startTime = mainLayer.startTime;
                new3dNull.inPoint = mainLayer.inPoint;
                new3dNull.outPoint = mainLayer.outPoint;
                deselectAll(comp);
                new3dNull.selected = true;
                break;

            case '3D+2D Null':
                var uniqueIndexForNulls = (function (comp) {
                    var baseNames = ["[1] 3D Null (Parent)", "[1] 2D Null (Child)"];
                    var index = 1;
                    var nameExists;

                    do {
                        nameExists = false;
                        for (var i = 0; i < baseNames.length; i++) {
                            var currentName = baseNames[i].replace("[1]", "[" + index + "]");
                            if (comp.layers.byName(currentName)) {
                                nameExists = true;
                                break;
                            }
                        }
                        if (nameExists) {
                            index++;
                        }
                    } while (nameExists);

                    return index;
                })(comp);
                var new3dNullName = "[" + uniqueIndexForNulls + "] 3D Null (Parent)";
                var new2dNullName = "[" + uniqueIndexForNulls + "] 2D Null (Child)";

                var new3dNull = comp.layers.addNull(comp.width);
                new3dNull.name = new3dNullName;
                new3dNull.threeDLayer = true;
                new3dNull.transform.position.setValue(projectedPositionValue);
                new3dNull.transform.orientation.setValue(projectedOrientationValue);
                new3dNull.transform.scale.setValue([100, 100, 100]);
                new3dNull.transform.scale.expression =
                    '// 3d scale imitation for 2d layers\n' +
                    'var camera = thisComp.activeCamera;\n' +
                    'var cameraPos = camera.position;\n' +
                    'var layerPos = thisLayer.position;\n' +
                    'var distance = length(cameraPos, layerPos);\n' +
                    'var baseScale = value[0];\n' +
                    'var cameraZoom = camera.zoom;\n' +
                    'var scaleFactor = cameraZoom / distance;\n' +
                    'var newScale = baseScale * scaleFactor;\n' +
                    '[newScale, newScale, newScale];';

                new3dNull.startTime = mainLayer.startTime;
                new3dNull.inPoint = mainLayer.inPoint;
                new3dNull.outPoint = mainLayer.outPoint;

                var new2dNull = comp.layers.addNull();
                new2dNull.name = new2dNullName;
                new2dNull.threeDLayer = false;
                new2dNull.startTime = mainLayer.startTime;
                new2dNull.inPoint = mainLayer.inPoint;
                new2dNull.outPoint = mainLayer.outPoint;
                new2dNull.position.expression =
                    '// 3d to 2d coordinates converter\n' +
                    'New3dNull = thisComp.layer(\"' + new3dNullName + '\");\n' +
                    'New3dNull.toComp(New3dNull.transform.anchorPoint);';
                new2dNull.scale.expression =
                    '// 3d to 2d scale\n' +
                    'scale3D = thisComp.layer(\"' + new3dNullName + '\").transform.scale;\n' +
                    '[scale3D[0], scale3D[1]];';
                deselectAll(comp);
                new3dNull.selected = true;

                break;

            default:
                alert("Select a type of layer you want to project.")
                break;
        }

        projectionLayer.remove();
        mainLayer.remove();

        app.endUndoGroup();
    }

    function deleteSetupButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (!comp.activeCamera) {
            alert("No active camera found.");
            return;
        }

        if (comp.selectedLayers.length === 0) {
            alert("Select at least one 'Extractor (Controller)' to delete a setup.");
            return;
        }

        var confirmDelete = confirm("Are you sure you want to delete the setup?");
        if (!confirmDelete) {
            return;
        }

        // -------------------Delete-------------------

        app.project.save();

        app.beginUndoGroup("Delete extractor");

        var selectedLayersAmount = comp.selectedLayers.length;
        var layersToDelete = [];
        var controllerFound = false;
        for (var i = selectedLayersAmount - 1; i >= 0; i--) {

            var mainLayer = comp.selectedLayers[i];

            if (mainLayer.name.indexOf("Extractor (Controller)") === -1) {
                continue;
            }

            controllerFound = true;
            var mainLayerName = mainLayer.name;
            var count = mainLayerName.slice(23);
            var projectedLayerName = "Extractor (Solid)" + (count > 1 ? " " + count : "");
            var projectionLayer = comp.layer(projectedLayerName);
            if (!projectionLayer) {
                alertPush("'" + projectedLayerName + "' not found. Delete it manually, if still exist.");
            } else {
                layersToDelete.push(projectionLayer);
            }
            layersToDelete.push(mainLayer);
        }

        for (var j = layersToDelete.length - 1; j >= 0; j--) {
            layersToDelete[j].remove();
        }

        if (alertMessage.length != 0) {
            alertShow();
        } else if (controllerFound) {
            alertCopy("All setups were deleted.")
        } else {
            alertCopy("Nothing to delete. Select at least one 'Extractor (Controller)' to delete a setup.")
        }

        app.endUndoGroup();
    }

    // -------------------Functions-------------------

    function uniqueIndex(comp, inputNames) {
        var isArray = inputNames && typeof inputNames.length === 'number' && typeof inputNames !== 'string';
        if (!isArray) {
            inputNames = [inputNames];
        }

        var uniqueNames = inputNames.slice();
        var index = 1;
        var nameExists;
        var result = {};

        do {
            nameExists = false;
            for (var i = 0; i < uniqueNames.length; i++) {
                var currentName = uniqueNames[i] + (index > 1 ? " " + index : "");
                if (comp.layers.byName(currentName)) {
                    nameExists = true;
                    break;
                }
            }
            if (nameExists) {
                index++;
            }
        } while (nameExists);

        for (var i = 0; i < uniqueNames.length; i++) {
            var finalName = uniqueNames[i] + (index > 1 ? " " + index : "");
            result[uniqueNames[i]] = finalName;
        }

        return isArray ? result : result[inputNames[0]];
    }

    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function deselectAll(comp) {
        var selectedLayers = comp.selectedLayers;
        for (var i = selectedLayers.length - 1; i >= 0; i--) {
            selectedLayers[i].selected = false;
        }
    }

    function alertPush(message) {
        alertMessage.push(message);
    }

    function alertShow(message) {

        alertMessage.push(message);

        if (alertMessage.length === 0) {
            return;
        }

        var allMessages = alertMessage.join("\n\n")

        var dialog = new Window("dialog", "Debug");
        var textGroup = dialog.add("group");
        textGroup.orientation = "column";
        textGroup.alignment = ["fill", "top"];

        var text = textGroup.add("edittext", undefined, allMessages, { multiline: true, readonly: true });
        text.alignment = ["fill", "fill"];
        text.preferredSize.width = 300;
        text.preferredSize.height = 300;

        var closeButton = textGroup.add("button", undefined, "Close");
        closeButton.onClick = function () {
            dialog.close();
        };

        dialog.show();

        alertMessage = [];

    }

    function alertCopy(message) {

        if (message === undefined || message === "") {
            return;
        }

        var dialog = new Window("dialog", "Information");
        var textGroup = dialog.add("group");
        textGroup.orientation = "column";
        textGroup.alignment = ["fill", "top"];

        var text = textGroup.add("edittext", undefined, message, { multiline: true, readonly: true });
        text.alignment = ["fill", "fill"];
        text.preferredSize.width = 300;
        text.preferredSize.height = 150;

        var closeButton = textGroup.add("button", undefined, "Close");
        closeButton.onClick = function () {
            dialog.close();
        };

        dialog.show();

        alertMessage = [];

    }

    // -------------------Show UI-------------------

    var myScriptPal = buildUI(thisObj);
    if ((myScriptPal != null) && (myScriptPal instanceof Window)) {
        myScriptPal.center();
        myScriptPal.show();
    }
    if (this instanceof Panel)
        myScriptPal.show();
}
pointTriangulator(this);

// --------------------------------------
