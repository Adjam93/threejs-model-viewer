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
            //+ 'Size of file ' + Math.round(size / 1048576) + 'Mbs'
            //+ '<br>'
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

                model = loader.parse(contents);

                var geometry;
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        numOfMeshes++;
                        geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

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

                        setWireFrame(child);
                        setWireframeAndModel(child);

                        glowModel = new THREE.Mesh(child.geometry, materials.glowMaterial);
                        materials.glowMaterial.visible = false;
                        glowModel.position = model.position;
                        glowModel.scale.multiplyScalar(1.025);
                        model.add(glowModel);                      
                        setGlow(child);

                        setPhong(child);
                        setXray(child); 

                    }
                });

                setCamera(model);

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

                scene.add(model);

            }, false );
            reader.readAsText( file );

            break;


            //ADD MORE FILE TYPE CASES HERE E.G. STL, COLLADA



        case 'stl':

            reader.addEventListener('load', function (event) {

                //When file type matches case - remove sample model or remove previously loaded model from user file
                scene.remove(sample_model);
                removeModel();
                modelLoaded = true;

                var contents = event.target.result;

                var geometry = new THREE.STLLoader().parse(contents);

                console.log(geometry);

                model = new THREE.Mesh(geometry, materials.default_material);

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

                        //Merge vertices to clean up any unwanted vertex data - duplicated vertices are removed
                        //and faces' vertices are updated.
                        geometry2.mergeVertices();

                        //Need to compute these as some .stl models load in black, due to problem with normals
                        geometry2.computeVertexNormals();
                        geometry2.computeFaceNormals();

                        //Apply above changes to normal geometry, then convert back to three.js bufferGeometry
                        child.geometry = new THREE.BufferGeometry().fromGeometry(geometry2);

                        child.material = materials.default_material;

                        var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                        var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                        materials.wireframeAndModel.visible = false;
                        model.add(edges);

                        setWireFrame(child);  
                        setWireframeAndModel(child);

                        glowModel = new THREE.Mesh(child.geometry, materials.glowMaterial);
                        glowModel.visible = false;
                        materials.glowMaterial.visible = false;
                        glowModel.position = model.position;
                        glowModel.scale.multiplyScalar(1.025);
                        model.add(glowModel);

                        setGlow(child); 

                        setPhong(child);
                        setXray(child); 

                    }
                });

                setCamera(model);

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


                scene.add(model);

            }, false);

            if (reader.readAsBinaryString !== undefined) {

                reader.readAsBinaryString(file);

            } else {

                reader.readAsArrayBuffer(file);
            }

            break;

        default:

            alert( 'Unsupported file format (' + extension +  ').' );

            break;
    }

};
