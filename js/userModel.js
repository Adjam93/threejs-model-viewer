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

    if (event.dataTransfer.files.length > 0) {

        loadFile(event.dataTransfer.files[0]);
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
                modelWithTexLoaded = false;
                
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

                var geometry;
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        numOfMeshes++;
                        geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                        console.log(geometry);

                        if (geometry !== undefined) {
                         //Dislay file name, number of vertices and faces info of model
                         statsNode.innerHTML = 'Name of model/file: ' + '<span class="statsText">' + filename + '</span>'
                            + '<br>'
                            + 'Number of vertices: ' + '<span class="statsText">' + geometry.vertices.length + '</span>'
                            + '<br>'
                            + 'Number of faces: ' + '<span class="statsText">' + geometry.faces.length + '</span>'
                            + '<br>'
                            + 'Number of Meshes: ' + '<span class="statsText">' + numOfMeshes + '</span>';
                        }
    
                        child.material = materials.default_material;

                        var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(child);  //LARGE MODEL/SLOW LOADING - FINE
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

                //Reset only runs when user model is loaded, as sample models all have correct orientation
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
                    var geometry = new THREE.STLLoader().parse(contents);
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
                        //Convert to normal geometry in order to apply computation of vertex normals and face normals
                        //and to merge vertices.
                        var geometry2 = new THREE.Geometry().fromBufferGeometry(child.geometry);
                   
                        if (geometry2 !== undefined) {
                            //Dislay file name, number of vertices and faces info of model
                            statsNode.innerHTML = 'Name of model/file: ' + '<span class="statsText">' + filename + '</span>'
                                + '<br>'
                                + 'Number of vertices: ' + '<span class="statsText">' + geometry2.vertices.length + '</span>'
                                + '<br>'
                                + 'Number of faces: ' + '<span class="statsText">' + geometry2.faces.length + '</span>'
                                + '<br>'
                                + 'Number of Meshes: ' + '<span class="statsText">' + numOfMeshes + '</span>';
                        }

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
                //fixRotation(glowModel);

                //Reset only runs when user model is loaded, as sample models all have correct orientation
                $("#reset_rot").click(function () {
                    model.rotation.set(0, 0, 0);
                   // glowModel.rotation.set(0, 0, 0);
                    polar_grid_helper.rotation.set(0, 0, 0);
                    gridHelper.rotation.set(0, 0, 0);
                    axis_view.rotation.set(0, 0, 0);
                    $('input[name="rotate"]').prop('checked', false);
                });

                selectedObject = model;
                outlinePass.selectedObjects = [selectedObject];
                outlinePass.enabled = false;

                scene.add(model);

                objects.push(model);

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

                var loader = new THREE.ColladaLoader();
                //loader.options.convertUpAxis = true;

                try {
                    var collada = loader.parse(contents);
                }
                catch (err) {
                    //Model fails to load due to parsing error
                    alert("Problem parsing file: " + filename + "\n\n" + "ERROR MESSAGE: " + err.message);
                }

                collada.scene.name = filename;
                var dae = collada.scene;

                console.log(dae);

                dae.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {

                        var geometry2 = new THREE.Geometry().fromBufferGeometry(child.geometry);

                        if (geometry2 !== undefined) {
                            //Dislay file name, number of vertices and faces info of model
                            statsNode.innerHTML = 'Name of model/file: ' + '<span class="statsText">' + filename + '</span>'
                                + '<br>'
                                + 'Number of vertices: ' + '<span class="statsText">' + geometry2.vertices.length + '</span>'
                                + '<br>'
                                + 'Number of faces: ' + '<span class="statsText">' + geometry2.faces.length + '</span>';
                        }

                        console.log(child.geometry); //Original ColladaLoader uses normal geometry, 
                                                    //ColladaLoader2 uses BufferGeometry

                        //child.geometry = new THREE.BufferGeometry().fromGeometry(child.geometry);
                        var wireframe2;
                        var collada_geometry = new THREE.Geometry();

                        if (dae.children.length > 1) {
                            for (var i = 0; i < dae.children.length; i++) {
                                var col_child = dae.children[i];

                                console.log(dae.children.length);

                                if (col_child instanceof THREE.Mesh) {

                                    //When there is more than one child BufferGeometry, create a new geometry 
                                    //and merge it with the main new geometry (defined above as collada_geometry)
                                    var geom = new THREE.Geometry().fromBufferGeometry(col_child.geometry);
                                    collada_geometry.merge(geom);
                                    console.log(collada_geometry);

                                  //  var buffer_collada_geometry = new THREE.BufferGeometry().fromGeometry(collada_geometry);
                                   // console.log(buffer_collada_geometry);
                                }
                            }

                            model = new THREE.Mesh(collada_geometry, materials.default_material);
                            wireframe2 = new THREE.WireframeGeometry(collada_geometry);
                            glowModel = new THREE.Mesh(collada_geometry, materials.glowMaterial);


                            $('#smooth').change(function () {
                                
                                if (smooth.checked) {
                                    collada_geometry.mergeVertices();
                                    collada_geometry.computeVertexNormals();
                                    collada_geometry.computeFaceNormals();
                                }
                                else {
                                    collada_geometry.computeFlatVertexNormals();
                                }
                            });

                            console.log("More than one Geometry");
                        }
                        else {
                            var single_geom = new THREE.Geometry().fromBufferGeometry(child.geometry);

                            model = new THREE.Mesh(single_geom, materials.default_material);
                            wireframe2 = new THREE.WireframeGeometry(single_geom);
                            glowModel = new THREE.Mesh(single_geom, materials.glowMaterial);

                            console.log("One Geometry");

                            $('#smooth').change(function () {
                               
                                if (smooth.checked) {
                                    single_geom.mergeVertices();
                                    single_geom.computeVertexNormals();
                                    single_geom.computeFaceNormals();
                                    child.geometry = new THREE.BufferGeometry().fromGeometry(single_geom);
                                }
                                else {
                                    single_geom.computeFlatVertexNormals();
                                    child.geometry = new THREE.BufferGeometry().fromGeometry(single_geom);
                                }
                            });
                           
                        }

                        child.material = materials.default_material;

                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(model);
                        setWireframeAndModel(model);

                        setPhong(model);
                        setXray(model);
                    }

                });

              //  model.position.set(0, 0, 0);

                setCamera(model);
                setBoundBox(model);
                setPolarGrid(model);
                setGrid(model);
                setAxis(model);

                scaleUp(model);
                scaleDown(model);

                fixRotation(model);

                //Reset only runs when user model is loaded, as sample models all have correct orientation
                $("#reset_rot").click(function () {
                    model.rotation.set(0, 0, 0);
                    // glowModel.rotation.set(0, 0, 0);
                    polar_grid_helper.rotation.set(0, 0, 0);
                    gridHelper.rotation.set(0, 0, 0);
                    axis_view.rotation.set(0, 0, 0);
                    $('input[name="rotate"]').prop('checked', false);
                });

                selectedObject = model;
                outlinePass.selectedObjects = [selectedObject];
                outlinePass.enabled = false;

                scene.add(model);

            }, false);
            reader.readAsText(file);

            break;

        default:

            alert( 'Unsupported file format (' + extension +  ').' );

            break;
    }

};
