//Read file from input button
var model_file = document.getElementById('obj_file');

model_file.addEventListener('change', function (event) {

    var file = event.target.files[0];
    loadFile(file);

}); 

//Drag and drop files anywhere onto the viewer
document.addEventListener('dragover', function (event) {

    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

}, false);

document.addEventListener('drop', function (event) {
    
    event.stopPropagation(); //Only call loadFile function on drop event (default is to display file as plain text file).
    event.preventDefault();

    if (event.dataTransfer.files.length > 0 && event.dataTransfer.files.length < 2) {

        //Just one file selected e.g. .obj, .dae, .stl
        loadFile(event.dataTransfer.files[0]);
    }

   //More than 1 file (minimum two for model plus texture)
   else if (event.dataTransfer.files.length > 1) {

        //Send to file manager in userModelTextures.js
        var files = event.dataTransfer.files;
        loadFiles(files);
    }

}, false);


var loadFile = function (file) {

    var filename = file.name;
    var extension = filename.split('.').pop().toLowerCase();

    var reader = new FileReader();

    reader.addEventListener('progress', function (data) {

        if (data.lengthComputable) { //if size of file transfer is known
            var percentage = Math.round((data.loaded * 100) / data.total);
            console.log(percentage);
            statsNode.innerHTML = 'Loaded : ' + percentage + '%' + ' of ' + filename
            + '<br>'
            + '<progress value="0" max="100" class="progress"></progress>';
            $('.progress').css({ 'width': percentage + '%' });////Width of progress bar set to the current percentage of model loaded (progress bar therefore increases in width as model loads)
            $('.progress').val(percentage); //Set progress bar value to the current amount loaded
        }

    });

    switch (extension) {

        case 'obj':

            //When file type matches case - remove sample model or remove previously loaded model from user file
            scene.remove(sample_model);
            removeModel();
            modelLoaded = true;

            reader.addEventListener( 'load', function ( event ) {

            var contents = event.target.result;
            // model = loader.parse(contents);

            try {
                model = loader.parse(contents);
            }
            catch (err) {
                //Model fails to load due to parsing error
                alert("Problem parsing file: " + filename + "\n\n" + "ERROR MESSAGE: " + err.message);
            }

            model.traverse(function (child) {
                if (child instanceof THREE.Mesh) {

                    numOfMeshes++;
                    var geometry = child.geometry;
                    stats(filename, geometry, numOfMeshes);

                    child.material = materials.default_material;

                    var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                    var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                    materials.wireframeAndModel.visible = false;
                    model.add(edges);

                    setWireFrame(child);
                    setWireframeAndModel(child);

                    setPhong(child);
                    setXray(child);

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

            console.log(renderer.info.memory.geometries);

            //Some models may load in with incorrect rotation on X axis
            fixRotation(model);
            resetRotation(model);

            selectedObject = model;
            outlinePass.selectedObjects = [selectedObject];
            outlinePass.enabled = false;

            scene.add(model);             

        }, false );
        reader.readAsText( file );

        break;

        case 'stl':

            reader.addEventListener('load', function (event) {

                //When file type matches case - remove sample model or remove previously loaded model from user file
                scene.remove(sample_model);
                removeModel();
                modelLoaded = true;
                
                var contents = event.target.result;
              
                try {
                    var geometry = new THREE.STLLoader(manager).parse(contents);
                    console.log(geometry);
                }
                catch (err) {
                    //Model fails to load due to parsing error
                    alert("Problem parsing file: " + filename + "\n\n" + "ERROR MESSAGE: " + err.message);
                }

                model = new THREE.Mesh(geometry, materials.default_material);
                console.log(renderer.info.memory.geometries);

                model.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {

                        numOfMeshes++;
                        var geometry = child.geometry;
                        stats(filename, geometry, numOfMeshes);

                        child.material = materials.default_material;

                        var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(child);  
                        setWireframeAndModel(child);

                        setPhong(child);
                        setXray(child); 

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

            }, false);

            if (reader.readAsBinaryString !== undefined) {

                reader.readAsBinaryString(file);

            } else {

                reader.readAsArrayBuffer(file);
            }

            break;

        case 'dae':
     
            var onError = function (xhr) {
                console.log('ERROR');
            };

            reader.addEventListener('load', function (event) {

                //When file type matches case - remove sample model or remove previously loaded model from user file
                scene.remove(sample_model);
                removeModel();
                modelLoaded = true;

                var contents = event.target.result;

                var loader = new THREE.ColladaLoader(manager);

                try {
                    var collada = loader.parse(contents);
                }
                catch (err) {
                    //Model fails to load due to parsing error
                    alert("Problem parsing file: " + filename + "\n\n" + "ERROR MESSAGE: " + err.message);
                }

                var dae = collada.scene;
                console.log(dae);
                
                colladaMerge(dae, filename);

                setCamera(model);
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

            }, false);
            reader.readAsText(file);

            break;
            
            case 'fbx':

            reader.addEventListener('load', function (event) {

                scene.remove(sample_model);
                removeModel();
                modelLoaded = true;
                fbxLoaded = true;

                var contents = event.target.result;

                var loader = new THREE.FBXLoader(manager);
                try {
                    model = loader.parse(contents);
                    //console.log(fbx);
                }
                catch (err) {
                    //Model fails to load due to parsing error
                    alert("Problem parsing file: " + filename + "\n\n" + "ERROR MESSAGE: " + err.message);
                }

                if(model.animations){
                    var anims = model.animations;
                    addAnimation( model, anims );
                    animControl( model );
                    playAllAnimation(anims);
                }

                model.traverse(function (child) {

                    if (child.isMesh) {

                        numOfMeshes++;
                        var geometry = child.geometry;
                        stats(filename, geometry, numOfMeshes);

                        child.material.side = THREE.DoubleSide;

                        var wireframe2 = new THREE.WireframeGeometry(geometry);
                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(child);
                        setWireframeAndModel(child);

                        var originalMaterial = child.material;
                        //child.material = materials.default_material3;
                        setPhong(child, originalMaterial);
                        setXray(child, originalMaterial);
                    }
                    
                });

                setCamera(model);
                smooth.disabled = true;
                document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";

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

            }, false);
            reader.readAsArrayBuffer(file);

            break;

        case 'glb':
        case 'gltf':

            reader.addEventListener('load', function (event) {

                scene.remove(sample_model);
                removeModel();
                modelLoaded = true;
                gltfLoaded = true;

                var contents = event.target.result;
                var loader = new THREE.GLTFLoader(manager);

                var onError = function (err) {
                    alert("Problem parsing file: " + filename + "\n\n" + "ERROR MESSAGE: " + err.message);
                };

                loader.parse(contents, '', function (gltf) {

                    model = gltf.scene;
                    console.log(model);

                    var anims = gltf.animations;
                    addAnimation( model, anims );
                    animControl( model );
                    playAllAnimation(anims);

                    model.traverse(function (child) {

                        if (child.isMesh) {

                            numOfMeshes++;
                            var geometry = child.geometry;
                            stats(filename, geometry, numOfMeshes);

                            child.material.side = THREE.DoubleSide;
    
                            var wireframe2 = new THREE.WireframeGeometry(geometry);
                            var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                            materials.wireframeAndModel.visible = false;
                            model.add(edges);
    
                            setWireFrame(child);
                            setWireframeAndModel(child);
                            //child.material = materials.phongMaterial;

                            var originalMaterial = child.material;
                            console.log(originalMaterial);
                            setPhong(child, originalMaterial);
                            setXray(child, originalMaterial);
                        }
                        
                    });


                    setCamera(model);
                    smooth.disabled = true;
                    document.getElementById('smooth-model').innerHTML = "Smooth Model (Disabled)";

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

                }, onError);

            }, false);
            reader.readAsArrayBuffer(file);

            break;

        default:

            alert( 'Unsupported file format (' + extension +  ').' );

            break;
    }

};
