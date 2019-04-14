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

            model = collada.scene;
            modelWithTextures = true;

            var anims = collada.animations
            addAnimation( model, anims );
            animControl( model );
            playAllAnimation(anims);
            
            console.log(model);

            model.traverse(function (child) {

                if (child.isMesh) {
                    
                    if (child.material.length > 1) {
                        for (var i = 0; i < child.material.length; i++) {

                            child.material[i].side = THREE.DoubleSide;
                            //child.material[i].skinning = false;
                        }
                    }
                    else {
                        child.material.side = THREE.DoubleSide;
                       // child.material.skinning = false;
                    }


                    numOfMeshes++;
                    var geometry = child.geometry;
                    stats(dae_path, geometry, numOfMeshes);

                    var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                    var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                    materials.wireframeAndModel.visible = false;

                    model.rotation.set(0, 0, 0);

                    
                    setWireFrame(child);
                    setWireframeAndModel(child);
                    
                    var originalMaterial = child.material;
                    setXray(child, originalMaterial);
                    setPhong(child, originalMaterial);
                    
                    setBoundBox(child);
                    setGrid(child);
                    setPolarGrid(child);
                    setAxis(child);
                    
                    smooth.disabled = true;
                    document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";
                }

            });

            model.position.set(0, 0, 0);

            setCamera(model);
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
                modelWithTextures = true;

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
