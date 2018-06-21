var modelAndTextures = document.getElementById('modelPlusTexture');

modelAndTextures.addEventListener('change', function (event) {

    var files = event.currentTarget.files;
    loadFiles(files);

});

//LOAD AND ADD TO SCENE -> .OBJ, .MTL, .DAE AND ASSOCIATED IMAGE FILES
var loadFiles = function (files) {

    var obj_path, mtl_path, dae_path;
    var loadingObj = false, loadingDae = false;

    /*let geometries = [];
    let fileMaterials = [];
    let textures = [];
    var textureLoader = new THREE.TextureLoader();*/
      
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
            //console.log(blobURL); //Blob location created from files selected from file input
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


                    /*var index = child.geometry.index;
                    console.log(index);
                    var position = child.geometry.attributes.position;
                    var uv = child.geometry.attributes.uv;
                    var groups = child.geometry.groups;
                    console.log(groups);
                    var drawRange = child.geometry.drawRange;
                    var i, j, il, jl;
                    var group, groupMaterial;
                    var start, end;

                    var material2 = [];*/

                   /* if (Array.isArray(child.material)) {

                        for (i = 0, il = groups.length; i < il; i++) {

                            group = groups[i];
                            groupMaterial = child.material[group.materialIndex];
                            console.log(groupMaterial);
                            material2.push(groupMaterial);
                        }
                        model = new THREE.Mesh(child.geometry, material2);
                    }
                    else {
                        model = dae;
                    }*/
                   
                    var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                    var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                    materials.wireframeAndModel.visible = false;


                    //model = new THREE.Mesh(child.geometry, child.material);
                    model.rotation.set(0, 0, 0);


                    if (Array.isArray(child.material)) {
                        modelDuplicate = child.clone();
                       // modelDuplicate = new THREE.Mesh(child.geometry, materials.default_material2);
                        modelDuplicate.add(edges);
                    }
                    /*else if (model.children.length > 1) {
                        var collada_geometry = new THREE.BufferGeometry();
                        for (var i = 0; i < model.children.length; i++) {

                            var col_child = model.children[i];

                            if (col_child.isMesh || col_child.isSkinnedMesh) {
                                //var geom = col_child.geometry
                                collada_geometry.merge(col_child.geometry);
                            }
                        
                        }

                        modelDuplicate = new THREE.Mesh(collada_geometry, materials.default_material);
                        modelDuplicate.add(edges);
                        console.log(modelDuplicate);
                    }*/
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

                   /* const boundingBox = new THREE.Box3();

                    if (model.children.length > 1) {
                        boundingBox.setFromObject(child);
                    } else {
                         boundingBox.setFromObject(model);
                    }

                    const size = boundingBox.getSize();
                    const center = boundingBox.getCenter();
                    const geometry2 = new THREE.BoxGeometry(size.x, size.y, size.z);
                    const material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffff00 });
                    const box2 = new THREE.Mesh(geometry2, material);
                    box2.position.set(center.x, center.y, center.z);
                    setBoundBox(box2);*/


                   // setBoundBox(modelDuplicate);

                    setPolarGrid(model);
                    //setGrid(modelDuplicate);
                    setAxis(model);

                    /*IF JUST ONE CHILD GEOMETRY - SMOOTH WILL WORK, SO PASS INTO SETSMOOTH IF THIS IS THE CASE
                    OTHERWISE SET THE CHECKBOX AND TEXT TO DISABLED AS BELOW*/
                    //setSmooth(model);
                    smooth.disabled = true;
                    document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";
                }

            });

            //setCamera(modelDuplicate);
            //setSmooth(model);

            model.position.set(0, 0, 0);

            /*setBoundBox(model);
            setPolarGrid(model);
            setGrid(model);
            setAxis(model);*/

            scaleUp(model); scaleDown(model);

            fixRotation(model);
            //NEEDS OWN FUNCTION
            $("#reset_rot").click(function () {
                model.rotation.set(0, 0, 0);
                polar_grid_helper.rotation.set(0, 0, 0);
                gridHelper.rotation.set(0, 0, 0);
                axis_view.rotation.set(0, 0, 0);
                $('input[name="rotate"]').prop('checked', false);
            });


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

                       /* position = child.geometry.attributes.position;
                        position.dynamic = true;
                        for (var i = 0; i < position.count; i++) {

                            var x = 1.35 * Math.sin(i / 2);
                            position.setX(i, x);

                            var y = 1.35 * Math.sin(i / 2);
                            position.setY(i, y);

                            var z = 1.35 * Math.sin(i / 2);
                            position.setZ(i, z);
                        }*/

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