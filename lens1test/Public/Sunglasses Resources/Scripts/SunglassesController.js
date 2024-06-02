// SunglassesController.js
// Version: 0.0.3
// Event: Initialized
// Description: The primary script that drives the sunglasses template. Has
// a large assortment of exposed inputs and the logic to actually modify the
// template content based on these inputs

// @ui {"widget":"group_start", "label":"Frame Customization"}
// @input vec4 frameColor = {1, 1, 1, 1} {"widget":"color"}
// @input int frameType = 0 {"widget": "combobox", "values":[{"label": "Cat", "value": 0}, {"label": "Heart", "value": 1}, {"label": "Round", "value": 2}, {"label": "Aviator", "value": 3}, {"label": "Nerd", "value": 4}]}
// @input int frameMaterialType = 0 {"widget": "combobox", "values":[{"label": "Matte", "value": 0}, {"label": "Metallic", "value": 1}, {"label": "Glossy", "value": 2}]}
// @input bool clearFrame = false
// @input float frameAlpha = 0.5 {"showIf":"clearFrame", "widget":"slider", "min":0.0, "max":1.0, "step":0.01}
// @input float frameSize = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}
// @input float frameOffset = 0.0 {"widget":"slider", "min":-1.0, "max":1.0, "step":0.01}
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Lens Customization"}
// @input vec4 lensColor = {1, 1, 1, 1} {"widget":"color"}
// @input float lensAlpha = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}
// @input int lensRoughness = 0 {"widget":"slider", "min":0, "max":10, "step":1 , "showIf": "customReflection", "showIfValue": false}
// @input bool customReflection = false
// @input Asset.Texture reflectionTexture {"showIf":"customReflection"}
// @input float reflectionIntensity = 1.0 {"widget":"slider", "min":0.0, "max":10.0, "step":0.1, "showIf":"customReflection"}
// @input bool customSprite = false
// @input Asset.Texture spriteTexture {"showIf": "customSprite"}
// @input float spriteIntensity = 1.0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01, "showIf":"customSprite"}
// @input float spriteSize = 0.5 {"widget":"slider", "min":0, "max":1, "step":0.05, "showIf":"customSprite"}
// @input float spriteOffsetX = 0 {"widget":"slider", "min":-1, "max":1, "step":0.05, "showIf":"customSprite"}
// @input float spriteOffsetY = 0 {"widget":"slider", "min":-1, "max":1, "step":0.05, "showIf":"customSprite"}
// @ui {"widget":"group_end"}


// @input bool twoHeads = true

// @ui {"widget":"group_start", "label":"DO NOT EDIT", "showIf": "hideMe", "showIfValue": true}
// @input bool hideMe = false {"showIf": "hideMe"}
// @input Component.ScriptComponent properties
// @ui {"widget":"group_end"}

// @input bool advanced = false
// @ui {"widget":"group_start", "label":"Frames","showIf": "advanced"}
// @input SceneObject sunglassesObject
// @input Asset.Material frameMaterial
// @input SceneObject[] frames
// @input Asset.Texture[] frameParams
// @input Asset.Texture[] frameNormals
// @ui {"widget":"group_end"}

// @ui {"widget":"group_start", "label":"Lenses","showIf": "advanced"}
// @input Asset.Material lensMaterial
// @input Asset.Material lensMaterialCustom
// @input Asset.Texture[] reflectionTextures
// @input Component.MaterialMeshVisual[] lensMeshes
// @input Asset.Texture blackTexture
// @ui {"widget":"group_end"}


// @ui {"widget":"group_start", "label":"MultipleHeads","showIf": "advanced"}
// @input SceneObject headBinding
// @ui {"widget":"group_end"}



var logoAspect = 1.0;
var usableWidth = [0.1, 1.1];
var usableHeight = [0.1, 1.1];
var uvWidth = remap(script.spriteSize, 0, 1, usableWidth[0], usableWidth[1]);
var uvHeight = remap(script.spriteSize, 0, 1, usableHeight[0], usableHeight[1]);
var logoOffset = new vec2(script.spriteOffsetX, -script.spriteOffsetY);

var uvAspect = uvWidth / uvHeight;

function onLensTurnOn() {
    configureFramesCustomization();
    configureLensCustomization();
    configureFrameTransform();
    configureLogo();
    configureSecondHead();
}
var turnOnEvent = script.createEvent("TurnOnEvent");
turnOnEvent.bind(onLensTurnOn);

function configureFramesCustomization() {
    var frameColor = script.frameColor;

    if (script.frames && script.frameMaterial) {
        for (var i = 0; i < script.frames.length; i++) {
            if (script.frames[i]) {
                script.frames[i].enabled = false;
            }
        }

        if (script.frames[script.frameType]) {
            script.frames[script.frameType].enabled = true;
        }

        if (script.frameNormals) {
            script.frameMaterial.mainPass.normalTex = script.frameNormals[script.frameType];
        }

        if (script.frameParams) {
            script.frameMaterial.mainPass.materialParamsTex = script.frameParams[script.frameMaterialType];
        }

        if (script.clearFrame) {
            script.frameMaterial.mainPass.blendMode = 9;
        } else {
            script.frameMaterial.mainPass.blendMode = 6;
        }

        script.frameMaterial.mainPass.baseColor = setColorWithAlpha(frameColor, script.frameAlpha);
    }
}

function configureFrameTransform() {
    if (script.sunglassesObject) {
        var transform = script.sunglassesObject.getTransform();

        var ScaleTo = new vec3(
            transform.getLocalScale().x + script.frameSize,
            transform.getLocalScale().y + script.frameSize,
            transform.getLocalScale().z + script.frameSize
        );

        var OffsetTo = new vec3(
            transform.getLocalPosition().x,
            transform.getLocalPosition().y + (script.frameOffset * 2),
            transform.getLocalPosition().z
        );

        transform.setLocalScale(ScaleTo);
        transform.setLocalPosition(OffsetTo);
    }
}

function configureLensCustomization() {
    var lensColor = script.lensColor;

    if (script.lensMeshes) {
        if (script.customReflection) {
            for (var i = 0; i < script.lensMeshes.length; i++) {
                if (script.lensMeshes[i]) {
                    script.lensMeshes[i].mainMaterial = script.lensMaterialCustom;
                }
            }

            if (script.lensMaterialCustom) {
                if (script.reflectionTextures) {
                    script.lensMaterialCustom.mainPass.baseColor = setColorWithAlpha(lensColor, script.lensAlpha);

                    if (script.reflectionTexture) {
                        script.lensMaterialCustom.mainPass.reflectionTex = script.reflectionTexture;
                        script.lensMaterialCustom.mainPass.reflectionIntensity = script.reflectionIntensity;
                    } else {
                        print("SunglassesController: Please assign custom reflection map");
                    }
                }
            }
        } else {
            for (var j = 0; j < script.lensMeshes.length; j++) {
                if (script.lensMeshes[j]) {
                    script.lensMeshes[j].mainMaterial = script.lensMaterial;
                }
            }

            if (script.lensMaterial) {
                if (script.reflectionTextures) {
                    script.lensMaterial.mainPass.materialParamsTex = script.reflectionTextures[script.lensRoughness];
                    script.lensMaterial.mainPass.baseColor = setColorWithAlpha(lensColor, script.lensAlpha);
                }
            }
        }
    }
}


function configureLogo() {
    if (script.customSprite && script.spriteTexture) {
        if (script.customReflection && script.lensMaterialCustom) {
            setEmissiveTexture(script.lensMaterialCustom, script.spriteTexture, script.spriteIntensity);
        } else if (script.customReflection == false && script.lensMaterial) {
            setEmissiveTexture(script.lensMaterial, script.spriteTexture, script.spriteIntensity);
        }

        setTheLogoSize();
    } else {
        if (script.customReflection && script.lensMaterialCustom && script.blackTexture) {
            setEmissiveTexture(script.lensMaterialCustom, script.blackTexture, 0);
        } else if (script.customReflection == false && script.lensMaterial && script.blackTexture) {
            setEmissiveTexture(script.lensMaterial, script.blackTexture, 0);
        }
    }
}

function setTheLogoSize() {
    var logoWidth = script.spriteTexture.getWidth();
    var logoHeight = script.spriteTexture.getHeight();

    logoAspect = logoWidth / logoHeight;

    var newScaleX = 1;
    var newScaleY = 1;

    if (logoAspect >= uvAspect) {
        newScaleX = 1 / uvWidth;
        newScaleY = 1 / (uvWidth / logoAspect);
    } else {
        newScaleX = 1 / (uvHeight * logoAspect);
        newScaleY = 1 / uvHeight;
    }

    var logoScale = new vec2(newScaleX * 0.5, newScaleY * 0.5);
    var logoPlacement = new vec2((1.0 - logoScale.x) / 2, (1.0 - logoScale.y) / 2);
    logoOffset = new vec2(-logoPlacement.x * logoOffset.x, logoPlacement.y * logoOffset.y);

    if (script.customReflection && script.lensMaterialCustom) {
        script.lensMaterialCustom.mainPass.uv2Scale = logoScale;
        script.lensMaterialCustom.mainPass.uv2Offset = logoPlacement.sub(logoOffset);
    } else if (script.customReflection == false && script.lensMaterial) {
        script.lensMaterial.mainPass.uv2Scale = logoScale;
        script.lensMaterial.mainPass.uv2Offset = logoPlacement.sub(logoOffset);
    }
}

function configureSecondHead() {
    if (script.twoHeads) {
        for (var i = 1; i < 2; i++) {
            if (script.headBinding) {
                var secondHeadObject = script.headBinding.getParent().copyWholeHierarchy(script.headBinding);
                secondHeadObject.getComponent("Component.Head").faceIndex = i;
            } else {
                print("SunglassesController: Make sure Head Binding object exist and is set on the Sunglasses Properties [DO_NOT_EDIT] object.");
            }

        }
    }
}

function setEmissiveTexture(material, texture, intensity) {
    material.mainPass.emissiveTex = texture;
    material.mainPass.emissiveIntensity = intensity;
}

function setColorWithAlpha(color, alpha) {
    return new vec4(color.x, color.y, color.z, alpha);
}

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
