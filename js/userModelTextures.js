var modelAndTextures = document.getElementById('modelPlusTexture');

modelAndTextures.addEventListener('change', function (event) {

    var files = event.currentTarget.files;
    loadFiles(files);

});

//LOAD AND ADD TO SCENE -> .OBJ, .MTL, .DAE AND ASSOCIATED IMAGE FILES
var loadFiles = function (files) {

    var obj_path, mtl_path, dae_path;
    var loadingObj = false, loadingDae = false;
      
    var extraFiles = {}, file, imageFiles = [], image;
    for (var i = 0; i < files.length; i++) {
        file = files[i];
        extraFiles[file.name] = file;    

        console.log("Filename: " + files[i].name);
        console.log("Type: " + files[i].type);
        console.log(files[i]);
        console.log("Size: " + files[i].size + " bytes");

        //Filenames that end in .obj/.OBJ or .mtl/.MTL
        if (files[i].name.match(/\w*.obj\b/i)) {

            obj_path = files[i].name;
           // loadingDae = false;
            loadingObj = true;

            scene.remove(sample_model);
            removeModel();
            modelLoaded = true;
            console.log(obj_path);
        }

        if (files[i].name.match(/\w*.mtl\b/i)) {

            mtl_path = files[i].name;
            console.log(mtl_path);
        }

        if (files[i].name.match(/\w*.dae\b/i)) {

            dae_path = files[i].name;
           // loadingObj = false;
            loadingDae = true;

            scene.remove(sample_model);
            removeModel();
            modelLoaded = true;
            console.log(dae_path);
        }

    }

    const manager = new THREE.LoadingManager();
    manager.setURLModifier(function (url, path) {

        url = url.replace('data:application/', '');
        url = url.split(/[\/\\]/);
        url = url[url.length - 1];

        if (extraFiles[url] !== undefined) {

            const blobURL = URL.createObjectURL(extraFiles[url]);
            return blobURL;
        }

        return url;
    });

    if (loadingDae) {
        var collada_loader = new THREE.ColladaLoader(manager);
        collada_loader.load(dae_path, function (collada) {

            var dae = collada.scene;
            model = collada.scene;
            modelWithTexures = true;

            console.log(model);
            var objectHasUvs = false;

            model.traverse(function (child) {

                if (child.isMesh || child.isSkinnedMesh) {

                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                        child.material.skinning = false;
                    }

                    numOfMeshes++;
                    var geometry = child.geometry;
                    stats(dae_path, geometry, numOfMeshes);

                    const materials2 = Array.isArray(child.material)
                    console.log(materials2);                               
                    console.log(child.material.length);
                   
                    var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                    var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                    materials.wireframeAndModel.visible = false;

                    model.rotation.set(0, 0, 0);

                    if (Array.isArray(child.material)) {
                        modelDuplicate = child.clone();
                        modelDuplicate.add(edges);
                    }
                    else {
                        modelDuplicate = new THREE.Mesh(child.geometry, materials.default_material2);
                        model.add(edges);
                    }
                    
                    modelDuplicate.material.visible = false;
                    model.add(modelDuplicate);

                    setWireFrame(child);
                    setWireframeAndModel(child);
                    setXray(child, modelDuplicate);
                    setPhong(child, modelDuplicate);

                    setCamera(model);
                    setPolarGrid(model);
                    setGrid(modelDuplicate);
                    setAxis(model);
                    
                    smooth.disabled = true;
                    document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";
                }

            });

            model.position.set(0, 0, 0);

            scaleUp(model); scaleDown(model);

            fixRotation(model);
            resetRotation(model);

            selectedObject = model;
            outlinePass.selectedObjects = [selectedObject];
            outlinePass.enabled = false;

            scene.add(model);
        });
    }

    if (loadingObj) {
        var mtlloader = new THREE.MTLLoader(manager);
        mtlloader.load(mtl_path, function (materials_load) {
            var loader = new THREE.OBJLoader(manager);
            loader.setMaterials(materials_load);
            loader.load(obj_path, function (obj) {

                model = obj;
                modelWithTexures = true;

                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        if (child.material) {
                            child.material.side = THREE.DoubleSide;
                        }

                        numOfMeshes++;
                        var geometry = child.geometry;
                        stats(obj_path, geometry, numOfMeshes);
          
                        modelDuplicate = new THREE.Mesh(geometry, materials.default_material2);
                        modelDuplicate.material.visible = false;
                        model.add(modelDuplicate);

                        var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(child);
                        setWireframeAndModel(child);

                        setPhong(child, modelDuplicate);
                        setXray(child, modelDuplicate);
                        

                    }
                });

                setCamera(model);

                setSmooth(model);

                model.position.set(0, 0, 0);

                setBoundBox(model);
                setPolarGrid(model);
                setGrid(model);
                setAxis(model);

                scaleUp(model);
                scaleDown(model);

                fixRotation(model);
                resetRotation(model);

                selectedObject = model;
                outlinePass.selectedObjects = [selectedObject];
                outlinePass.enabled = false;

                scene.add(model);
            });
        });
    }
};    
