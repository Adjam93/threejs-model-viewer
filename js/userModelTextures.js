var modelAndTextures = document.getElementById('modelPlusTexture');

modelAndTextures.addEventListener('change', function (event) {

    var files = event.currentTarget.files;
    loadFiles(files);

});

//LOAD AND ADD TO SCENE -> .OBJ, .MTL, .DAE AND ASSOCIATED IMAGE FILES
var loadFiles = function (files) {

    var obj_path, mtl_path, dae_path, gltf_path, fbx_path;;
    var loadingObj = false, loadingDae = false, loadingGLTF = false, loadingFBX = false;
      
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
        
         if (files[i].name.match(/\w*.gltf\b/i)) {

            gltf_path = files[i].name;
            loadingGLTF = true;

            scene.remove(sample_model);
            removeModel();
            modelLoaded = true;
            console.log(gltf_path);
        }

        if (files[i].name.match(/\w*.fbx\b/i)) {

            fbx_path = files[i].name;
            loadingFBX = true;

            scene.remove(sample_model);
            removeModel();
            modelLoaded = true;
            console.log(fbx_path);
        }

    }

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

     if (loadingGLTF) {

        var gltf_loader = new THREE.GLTFLoader(manager);
        gltf_loader.load(gltf_path, function (gltf) {

            console.log(gltf);
            model = gltf.scene;
            modelWithTextures = true;
            console.log(model);

            //clone and animations
           // var clone = AnimationUtils.clone(model);
            var anims = gltf.animations;

            console.log(anims);
            addAnimation( model, anims );
            animControl( model );
            playAllAnimation(anims);

            model.traverse(function (child) {

                if (child.isMesh) {

                    if (child.material.length > 1) {
                        for (var i = 0; i < child.material.length; i++) {

                            child.material[i].side = THREE.DoubleSide;                         
                        }
                    } else {
                        child.material.side = THREE.DoubleSide;
                    }

                    console.log(child);

                    console.log(child.material.map);

                    numOfMeshes++;
                    var geometry = child.geometry;
                    stats(gltf_path, geometry, numOfMeshes);

                    var wireframe2 = new THREE.WireframeGeometry(geometry);
                    var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                    materials.wireframeAndModel.visible = false;
                    child.add(edges);

                    setWireFrame(child);
                    setWireframeAndModel(child);
                   
                    var originalMaterial = child.material;
                    setPhong(child, originalMaterial);
                    setXray(child, originalMaterial);
                
                }

            });
       
            setCamera(model);
            smooth.disabled = true;
            document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";

            setBoundBox(model);
            setPolarGrid(model);
            setGrid(model);
            setAxis(model);

            scaleUp(model); 
            scaleDown(model);

            fixRotation(model);
            resetRotation(model);

            model.position.set(0, 0, 0);

            selectedObject = model;
            outlinePass.selectedObjects = [selectedObject];
            outlinePass.enabled = false;

            scene.add(model);
        });
       
    }

    if (loadingFBX) {

        var fbx_loader = new THREE.FBXLoader(manager);
        fbx_loader.load(fbx_path, function (fbx) {

            console.log(fbx);
            model = fbx;
            modelWithTextures = true;
            console.log(model);
        
            var anims = fbx.animations;
            addAnimation( model, anims );
            animControl( model );
            playAllAnimation(anims);
            
            model.traverse(function (child) {

                if (child.isMesh) {

                    if (child.material.length > 1) {
                        for (var i = 0; i < child.material.length; i++) {

                            child.material[i].side = THREE.DoubleSide;
                        }
                    } else {
                        child.material.side = THREE.DoubleSide;
                    }

                    console.log(child);

                    numOfMeshes++;
                    var geometry = child.geometry;
                    stats(fbx_path, geometry, numOfMeshes);

                    var wireframe2 = new THREE.WireframeGeometry(geometry);
                    var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                    materials.wireframeAndModel.visible = false;
                    child.add(edges);

                    setWireFrame(child);
                    setWireframeAndModel(child);

                    var originalMaterial = child.material;
                    setPhong(child, originalMaterial);
                    setXray(child, originalMaterial);
                }

            });

            setCamera(model);
            smooth.disabled = true;
            document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";  

            setBoundBox(model);
            setPolarGrid(model);
            setGrid(model);
            setAxis(model);

            scaleUp(model); scaleDown(model);

            fixRotation(model);
            resetRotation(model);

            model.position.set(0, 0, 0);

            selectedObject = model;
            outlinePass.selectedObjects = [selectedObject];
            outlinePass.enabled = false;

            scene.add(model);
        });
    }
    
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
          
                        var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(child);
                        setWireframeAndModel(child);
                        
                        var originalMaterial = child.material;
                        setXray(child, originalMaterial);
                        setPhong(child, originalMaterial);                

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
