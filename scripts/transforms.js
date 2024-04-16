import { Matrix, Vector } from "./matrix.js";

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    // 3. shear such that CW is on the z-axis
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])

    
    let translatePRP = new Matrix(4, 4);
    translatePRP.values = [[1, 0, 0, -(prp.x)],
                           [0, 1, 0, -(prp.y)],
                           [0, 0, 1, -(prp.z)],
                           [0, 0, 0, 1]];

                  
    let n = prp.subtract(srp);
    n.normalize();
    let u = vup.cross(n); 
    u.normalize();
    let v = n.cross(u);

    let CW = new Vector(3);
    CW.x = (clip[0] + clip[1]) / 2;
    CW.y = (clip[0] + clip[3]) / 2;
    CW.z = -clip[4];

    let DOP = new Vector(3);
    DOP = CW;

    let rotateVRC = new Matrix(4, 4);
    rotateVRC.values = [[u.x, u.y, u.z, 0],
                        [v.x, v.y, v.z, 0],
                        [n.x, n.y, n.z, 0],
                        [0, 0, 0, 1]];
    
    let shearCW = new Matrix(4, 4);
    mat4x4ShearXY(shearCW, -DOP.x/DOP.z, -DOP.y/DOP.z);

    let scalePer = new Matrix(4, 4);
    let scaleX = (2 * clip[4])/((clip[1] - clip[0]) * clip[5]);
    let scaleY = (2 * clip[4])/((clip[3] - clip[2]) * clip[5]);
    let scaleZ = 1 / clip[5];
    scalePer.values = [[scaleX, 0, 0, 0],
                   [0, scaleY, 0, 0],
                   [0, 0, scaleZ, 0],
                   [0, 0, 0, 1]];

    let nPer = Matrix.multiply([scalePer, shearCW, rotateVRC, translatePRP]);
    let mPer = new Matrix(4, 4);
    mPer.values = [[1, 0, 0, 0],
                   [0, 1, 0, 0],
                   [0, 0, 1, 0],
                   [0, 0, -1, 0]];
    return Matrix.multiply([mPer, nPer]);
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
                   [0, 1, 0, 0],
                   [0, 0, 1, 0],
                   [0, 0, -1, 0]];
    return mper;
}

// create a 4x4 matrix to translate/scale projected vertices to the viewport (window)
function mat4x4Viewport(width, height) {
    let viewport = new Matrix(4, 4);
    viewport.values = [[width/2, 0, 0, width/2],
                      [0, height/2, 0, height/2],
                      [0, 0, 1, 0],
                      [0, 0, 0, 1]];
    return viewport;
}


///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1,        0,              0,          0],
                     [0, Math.cos(theta), -Math.sin(theta), 0],
                     [0, Math.sin(theta),  Math.cos(theta), 0],
                     [0,        0,              0,          1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta),  0, Math.sin(theta), 0],
                     [      0,          1,       0,         1],
                     [-Math.sin(theta), 0, Math.cos(theta), 0],
                     [      0,          0,       0,         1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), -Math.sin(theta), 0, 0],
                     [Math.sin(theta),  Math.cos(theta), 0, 0],
                     [      0,                  0,       1, 0],
                     [      0,                  0,       0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0,  1,  0],
                     [0, 0,  0,  1]];
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}

export {
    mat4x4Perspective,
    mat4x4MPer,
    mat4x4Viewport,
    mat4x4Identity,
    mat4x4Translate,
    mat4x4Scale,
    mat4x4RotateX,
    mat4x4RotateY,
    mat4x4RotateZ,
    mat4x4ShearXY,
    Vector3,
    Vector4
};
