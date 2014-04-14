#ifndef B2FRICTIONJOINTJSBINDINGS_H
#define B2FRICTIONJOINTJSBINDINGS_H

extern "C" {
// The creation function lives off of b2World, but we put it here for neatness
void* b2FrictionJointDef_CreateJoint(
    void* world,
    //joint def
    void* bodyA, void* bodyB, double collideConnected,
    // friction joint def
    double localAnchorAx, double localAnchorAy,
    double localAnchorBx, double localAnchorBy, double maxForce,
    double maxTorque);

}

#endif
