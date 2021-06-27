// The uniform variable is set up in the javascript code and the same for all vertices
uniform vec3 virusOffset;
uniform mat4 dodgeFrame;
uniform mat4 pelvisFrame;
uniform mat4 pelvisInverse;

// The shared variable is initialized in the vertex shader and attached to the current vertex being processed,
// such that each vertex is given a shared variable and when passed to the fragment shader,
// these values are interpolated between vertices and across fragments,
// below we can see the shared variable is initialized in the vertex shader using the 'out' qualifier
out vec3 colour;

void main() {
    // Vertex position in world coordinates.
    // HINT: You will need to change worldPos to make the Armadillo dodge the virus.
    // HINT: Q1e should be done entirely in this shader.

    // above or below
    vec4 temp = modelMatrix*vec4(position, 1.0);
    // above waist
    if(position.y >= 20.0){
        temp = modelMatrix*pelvisFrame*dodgeFrame*pelvisInverse*vec4(position, 1.0);

    }

    vec4 worldPos = temp;

    // This should really be transformed by the pelvis transform if on the upper body
    // vertex normal in camera frame, but we won't worry about correct shading for this assignment.
    vec3 vertexNormal = normalize(normalMatrix*normal);

    // Set light direction, in camera frame.
    vec3 lightDirection = normalize(vec3(viewMatrix*(vec4(virusOffset - worldPos.xyz, 0.0))));

   float vertexColour = dot(lightDirection, vertexNormal);
    colour = vec3(vertexColour);

    // Multiply each vertex by the model matrix to get the world position of each vertex,
    // then the view matrix to get the position in the camera coordinate system,
    // and finally the projection matrix to get final vertex position
    gl_Position = projectionMatrix * viewMatrix * worldPos;

}
