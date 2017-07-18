/*READ FILE*/
document.getElementById('obj_file').addEventListener('change', readFile, false); //Read .obj file

var fileType = ['obj'];
var reader;

function readFile(evt) {
    if (evt.target.files && evt.target.files[0]) {
        var extension = evt.target.files[0].name.split('.').pop().toLowerCase(), //get .obj file extension from input file
            isSuccess = fileType.indexOf(extension) > -1;  //is extension acceptable type

        if (isSuccess) {
            scene.remove(sample_model);

            modelLoaded = true;
            var fileObject = evt.target.files[0];
            reader = new FileReader();

            var tmppath = URL.createObjectURL(evt.target.files[0]); //Testing a temporary path for .obj file

            reader.onload = function (e) {
                 //on each load of .obj file remove current file from scene before adding new selected file
                //and uncheck any boxes
                removeModel();

                document.getElementById("scale_up").disabled = false;
                document.getElementById("scale_down").disabled = false;

                loader.setPath(tmppath)
                console.log(tmppath);

                model = loader.parse(this.result); //Set model to be the user file
                $("#disp_tmp_path").html("Temporary Path --> <strong>[" + tmppath + "]</strong>"); //Display temp path

                var geometry;
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

                        if (geometry !== undefined) {
                            //Dislay file name, number of vertices and faces info of model
                            statsNode.innerHTML = 'Name of model/file: ' + fileObject.name
                                + '<br>'
                                + 'Number of vertices: ' + geometry.vertices.length
                                + '<br>'
                                + 'Number of faces: ' + geometry.faces.length;
                        }

                        child.material = materials.default_material;            

                        setWireFrame(child);
                        setWireframeAndModel(model);
                        setGlowModel(model);
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

                /*Some models may load in with incorrect rotation on X axis*/
                $("#Rotate_X").click(function () {

                    model.rotation.x = -Math.PI / 2;
                    polar_grid_helper.rotation.x = Math.PI / 2;
                    gridHelper.rotation.x = Math.PI / 2;
                    axis_view.rotation.x = Math.PI / 2;
                });

                scene.add(model);
            };
            reader.readAsText(fileObject);
        }
        else { //File other than .obj type selected
            alert("Wrong file type, please select .obj files only");
        }

        var size = document.getElementById('obj_file').files[0].size;

        //progress/loading bar
        reader.onprogress = function (data) {
            if (data.lengthComputable) { //if size of file transfer is known
                var percentage = Math.round((data.loaded * 100) / data.total);
                console.log(percentage);
                statsNode.innerHTML = 'Loaded : ' + percentage + '%' + ' of ' + fileObject.name
                + '<br>'
                + '<progress value="0" max="100" class="progress"></progress>';
                // + 'Size of file ' + Math.round(size / 1048576) + 'Mbs';
                $('.progress').css({ 'width': percentage + '%' });////Width of progress bar set to the current percentage of model loaded (progress bar therefore increases in width as model loads)
                $('.progress').val(percentage); //Set progress bar value to the current amount loaded
            }
        }
    }
}
