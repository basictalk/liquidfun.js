#ifndef B2REVOLUTEJOINTJSBINDINGS_H
#define B2REVOLUTEJOINTJSBINDINGS_H

extern "C" {
void* b2RevoluteJointDef_Create(
    void* world,
    //Joint def
    void* bodyA, void* bodyB, double collideConnected,
    //revoluteJointDef
    double enableLimit, double enableMotor,   double lowerAngle,
    double localAnchorAx, double localAnchorAy, double localAnchorBx,
    double localAnchorBy, double maxMotorTorque, double motorSpeed,
    double referenceAngle, double upperAngle);

void* b2RevoluteJointDef_InitializeAndCreate(
    void* world,
    // initialize args
    void* bodyA, void* bodyB, double anchorX, double anchorY,
    //revoluteJointDef
    double collideConnected, double enableLimit,
    double enableMotor, double lowerAngle, double maxMotorTorque,
    double motorSpeed, double upperAngle);

void b2RevoluteJoint_SetMotorSpeed(void* joint, double speed);
}

#endif
