/*
 * UBC CPSC 314, Vjan2021
 * Assignment 2 Template
 */

// Setup and return the scene and related objects.
// You should look into js/setup.js to see what exactly is done here.
const {
  renderer,
  scene,
  camera,
  worldFrame,
} = setup();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Initialize uniforms

// As in A1 we position the virus in the world solely using this uniform
// So the initial y-offset being 1.0 here is intended.
const virusOffset = { type: 'v3', value: new THREE.Vector3(0.0, 1.0, 0.0) };

// Pelvis frame is set with respect to the Armadillo.
const pelvisFrame = new THREE.Object3D();
// Position the pelvis in Aramdillo's object coordinate frame (note that the Armadillo is scaled).
pelvisFrame.position.copy(new THREE.Vector3(0.0, 20.0, 10.0));

// Dodge frame with respect to the Pelvis frame
const dodgeFrame = new THREE.Object3D();
pelvisFrame.add(dodgeFrame);
// Important: since we will manually update the dodge matrix,
// don't let the automatic scene graph traversal overwrite it.
  dodgeFrame.matrixAutoUpdate = false;

// Distance threshold beyond which the armadillo should shoot lasers at the sphere (needed for Q1c).
const LaserDistance = 10.0;
// Minimum safe distance to virus (needed for Q1d).
const MinDistance = 6.0;
// Maximum hieght beyond which there is no point in dodging the virus (needed for Q1d).
const MaxHeight = 10.0;

//pelvisInverse.copy(pelvisFrame.matrix);
//pelvisInverse.invert();
// Materials: specifying uniforms and shaders
var pelvisInverse = new THREE.Matrix4(); 
var pelvisMatrix = new THREE.Matrix4();

const armadilloMaterial = new THREE.ShaderMaterial({
  uniforms: {
    virusOffset: virusOffset,
    dodgeFrame: {value: dodgeFrame.matrix},
    pelvisFrame: {value: pelvisMatrix},
    pelvisInverse: {value: pelvisInverse},
    // HINT: to add a Matrix4 uniform use  the syntax:
    // <uniform name>: { value: <matrix4 variable name> },
    // You may need to add more than one.
    // HINT: Each frame has an associated transform accessibly via the `matrix` property.
  }
});

const sphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    virusOffset: virusOffset
  }
});

const eyeMaterial = new THREE.ShaderMaterial();

// HINT: Remember to add laser shaders if you decide to use a shader material for lasers.

// Load shaders.
const shaderFiles = [
  'glsl/armadillo.vs.glsl',
  'glsl/armadillo.fs.glsl',
  'glsl/sphere.vs.glsl',
  'glsl/sphere.fs.glsl',
  'glsl/eye.vs.glsl',
  'glsl/eye.fs.glsl',
];

new THREE.SourceLoader().load(shaderFiles, function (shaders) {
  armadilloMaterial.vertexShader = shaders['glsl/armadillo.vs.glsl'];
  armadilloMaterial.fragmentShader = shaders['glsl/armadillo.fs.glsl'];

  sphereMaterial.vertexShader = shaders['glsl/sphere.vs.glsl'];
  sphereMaterial.fragmentShader = shaders['glsl/sphere.fs.glsl'];

  eyeMaterial.vertexShader = shaders['glsl/eye.vs.glsl'];
  eyeMaterial.fragmentShader = shaders['glsl/eye.fs.glsl'];
});

// Load and place the Armadillo geometry.
loadAndPlaceOBJ('obj/armadillo.obj', armadilloMaterial, function (armadillo) {
  armadillo.rotation.y = Math.PI;
  armadillo.scale.set(0.1, 0.1, 0.1);
  armadillo.position.set(0.0, 5.3, -8.0)
  armadillo.add(pelvisFrame);
  scene.add(armadillo);
});

// Create the main covid sphere geometry
// https://threejs.org/docs/#api/en/geometries/SphereGeometry
const sphereGeometry = new THREE.SphereGeometry(1.0, 32.0, 32.0);
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const sphereLight = new THREE.PointLight(0xffffff, 1, 100);
scene.add(sphereLight);

// Eyes (Q1a and Q1b)
// Create the eye ball geometry
const eyeGeometry = new THREE.SphereGeometry(1.0, 32, 32);

// HINT: Replace the following with two eye ball meshes from the same geometry.

//Eyes
// 0.0, 5.3, -8.0
// HINT: Add the eyes to the dodgeFrame to ensure they will follow the body when you implement Q1d.
const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
dodgeFrame.add(eyeL);
eyeL.position.set(6.0,48.0,-40.0);
eyeL.scale.set(5.0, 5.0, 5.0);


const eyeR = new THREE.Mesh(eyeGeometry, eyeMaterial);

dodgeFrame.add(eyeR);
eyeR.position.set(-6.0,48.0,-40.0);
eyeR.scale.set(5.0, 5.0, 5.0);

// Lasers (Q1c)
// HINT: You can use THREE.CylinderGeometry to create lasers easily:
//       https://threejs.org/docs/index.html#api/en/geometries/CylinderGeometry
// NOTE: These could also be made with two camera facing trinagles or quads instead of a full blown
//       cylinder.
var geometry = new THREE.CylinderGeometry( 0.25, 0.20, 1.0, 32 );
geometry.rotateX(-Math.PI * 0.5);
const material = new THREE.MeshBasicMaterial( {color: 0xbc13fe} );
const laserL = new THREE.Mesh( geometry, material );
const laserR = new THREE.Mesh( geometry, material );

// HINT: To have lasers inherit the eye transforms, make them children of the eyeballs you created
// above.


eyeL.add(laserL);
eyeR.add(laserR);

laserL.visible = false;
laserR.visible = false;


// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("W"))
    virusOffset.value.z -= 0.3;
  else if (keyboard.pressed("S"))
    virusOffset.value.z += 0.3;

  if (keyboard.pressed("A"))
    virusOffset.value.x -= 0.3;
  else if (keyboard.pressed("D"))
    virusOffset.value.x += 0.3;

  if (keyboard.pressed("E"))
    virusOffset.value.y -= 0.3;
  else if (keyboard.pressed("Q"))
    virusOffset.value.y += 0.3;

  // HINT: You may need to place code or call functions here to make sure your tranforms are updated
  // whenever the virus position changes.
  pelvisMatrix = pelvisFrame.matrix.clone();
  pelvisInverse = pelvisFrame.matrix.clone();
  pelvisInverse.invert();

  // The following tells three.js that some uniforms might have changed.
  armadilloMaterial.needsUpdate = true;
  sphereMaterial.needsUpdate = true;
  eyeMaterial.needsUpdate = true;

  // Move the sphere light in the scene. This allows the floor to reflect the light as it moves.
  sphereLight.position.set(virusOffset.value.x, virusOffset.value.y, virusOffset.value.z);

// variables!

const orginL = new THREE.Vector3( eyeL.getWorldPosition().x, eyeL.getWorldPosition().y, eyeL.getWorldPosition().z);
const orginR = new THREE.Vector3( eyeR.getWorldPosition().x, eyeR.getWorldPosition().y, eyeR.getWorldPosition().z);

const viruspos =new THREE.Vector3 (virusOffset.value.x, virusOffset.value.y, virusOffset.value.z);

var distL = viruspos.distanceTo(orginL);
var distR = viruspos.distanceTo(orginR);

  // HINT: Use one of the lookAt funcitons available in three.js to make the eyes look at the virus.
  // HINT: Remember to update these matrices every time the virus changes position.
  //console.log("here " + virusOffset.value.y);
  eyeR.lookAt(viruspos);
  eyeL.lookAt(viruspos);


  // HINT: Remember that LaserDistance is given in world space units, but the actual scale of the
  // lasers may be set in a different (possibly scaled) frame.
  // HINT: As with eyes, remember that these need to be updated with every time the virus position
  // changes.
//eye
  laserL.position.z = distL;
  laserR.position.z = distR;
  laserL.scale.set(1.0, 1.0, distL*2);
  laserR.scale.set(1.0, 1.0, distR*2);

if(((distL+distR)/2)<=LaserDistance){
  laserL.visible = true;
  laserR.visible = true;
}else{
  laserL.visible = false;
  laserR.visible = false;
}
  // Dodge (Q1d)
  // Make the armadillo dodge the virus by rotating the body away from the virus.

  // HINT: Like with lasers, remember that MaxHeight and MinDistance is given in world space
  // units, but the actual transformation will happen in a different (possibly scaled) frame.
//pelvisFrame.getWorldPosition().x, pelvisFrame.getWorldPosition().y, pelvisFrame.getWorldPosition().z
  const orginA = new THREE.Vector3(0.0, 7, -8.0);
  //const orgin = new THREE.Vector3();
  var distA = viruspos.distanceTo(orginA);
  console.log("here"+viruspos.y);

  /// normalize the vector from pelvis origin to virus
  var newLine =  new THREE.Vector3(orginA.x,orginA.y,orginA.z);
  newLine.add(viruspos);
  newLine.normalize();

  // arctan each of this vector's xyz components with 1.0?
var ange = 0.0;


console.log(distA);
  // if v within min distance
  if (distA <= MinDistance){
    // if  v not above max hieght->max MaxHeight is scaled //LONG armadillo!
    if(viruspos.y <= MaxHeight*2){
      // if v not below waist
      if(viruspos.y >= orginA.y){
        if (viruspos.x>0){
          ange = 1 *distA/6.0;
        }else{
          ange = -1+distA/6.0;
        }



      }
    }
  }
  //const matrixY = new THREE.Matrix4();
  //matrixY.makeRotationZ(arctanX);
  //Xaxis
//  const matrixX = new THREE.Matrix4();
//  matrixX.makeRotationX(2*  -arctanZ);

  //dodgeFrame.matrix.copy(matrixX.multiply(matrixY));
//TESTING

//.multiplyMatrices();
 //ange = orgin.angleTo(viruspos);
dodgeFrame.setRotationFromAxisAngle(viruspos .normalize(),ange);
dodgeFrame.updateMatrix();

//(0.0, 5.3, -8.0)
/*
 dodgeFrame.matrix.set{
   Math.cos(ange), 0, -Math.sin(ange),0,1,0, Math.sin(ange),0,Math.cos(ange)
 }
*/

//cutting error- how to fix??
// eye error - how to fix??
//part e 20%
//dodgeFrame.matrix.makeRotationYZX Does not work. Nor does dodgeFrame.rotateXYZ







}

// Setup update callback
function update() {
  checkKeyboard();

  // Requests the next update call, this creates a loop
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

// Start the animation loop.
update();
