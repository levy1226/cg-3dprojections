import { Matrix, Vector } from "./matrix.js";

// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) {
    // 1. translate PRP to origin
    let t = new Matrix(4, 4);
    t.values = [[1, 0, 0, -(prp.x)],
                [0, 1, 0, -(prp.y)],
                [0, 0, 1, -(prp.z)],
                [0, 0, 0, 1]];

    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let n = prp.subtract(srp); //from SRP to PRP
    n.normalize();

    let u = vup.cross(n); //right
    u.normalize();

    let v = n.cross(u); //up

    // 3. shear such that CW is on the z-axis
    let r = new Matrix(4,4);
    r.values = [[u.x, u.y, u.z, 0],
                [v.x, v.y, v.z, 0],
                [n.x, n.y, n.z, 0],
                [0,   0,   0,   1]];

    let directionOfProjection = new Vector(3);
    directionOfProjection = [(clip[0] + clip[1])/2, (clip[2] + clip[3]/2), -clip[4]];

    let shearXParallel = -directionOfProjection[0] / directionOfProjection[2];
    let shearYParallel = -directionOfProjection[1] / directionOfProjection[2];
    let shPar = new Matrix(4,4);

    mat4x4ShearXY(shPar, shearXParallel, shearYParallel);

    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    
    //L, R, B, T, N, F
    let PerspectiveScale = new Matrix(4, 4);
    let PerspectiveScaleX = (2 * clip[4]) / ((clip[1] - clip[0]) * clip[5]);
    let PerspectiveScaleY = (2 * clip[4]) / ((clip[3] - clip[2]) * clip[5]);
    let PerspectiveScaleZ = 1 / clip[5];

    mat4x4Scale(PerspectiveScale, PerspectiveScaleX, PerspectiveScaleY, PerspectiveScaleZ);

    let nPer = Matrix.multiply([PerspectiveScale, shPar, r, t]);
    let mPer = new Matrix(4, 4);
    mPer.values = [[1, 0, 0, 0],
                   [0, 1, 0, 0],
                   [0, 0, 1, 0],
                   [0, 0, -1, 0]];
    // return transform;
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
