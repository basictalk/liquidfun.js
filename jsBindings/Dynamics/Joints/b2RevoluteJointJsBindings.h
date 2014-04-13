#ifndef B2REVOLUTEJOINTJSBINDINGS_H
#define B2REVOLUTEJOINTJSBINDINGS_H

extern "C" {
void* b2RevoluteJoint_InitializeAndCreate(void* world, void* bodyA, void* bodyB,
                              double anchorX, double anchorY,
                              //revoluteJointDef
                              double collideConnected, double enableLimit,
                              double enableMotor, double lowerAngle, double maxMotorTorque,
                              double motorSpeed, double upperAngle, double userData);

void b2RevoluteJoint_SetMotorSpeed(void* joint, double speed);
}

#endif
