#ifndef B2PRISMATICJOINTJSBINDINGS_H
#define B2PRISMATICJOINTJSBINDINGS_H

extern "C" {
void* b2PrismaticJointDef_Create(
    void* world,
    // joint def
    void* bodyA, void* bodyB, double collideConnected,
    // prismatic joint def
    double enableLimit, double enableMotor, double localAnchorAx,
    double localAnchorAy, double localAnchorBx, double localAnchorBy,
    double localAxisAx, double localAxisAy, double lowerTranslation,
    double maxMotorForce, double motorSpeed, double referenceAngle,
    double upperTranslation);

void* b2PrismaticJointDef_InitializeAndCreate(
    void* world,
    void* bodyA, void* bodyB, double anchorX, double anchorY, double axisX,
    double axisY,
    //joint def
    double collideConnected,
    //prismatic joint def
    double enableLimit, double enableMotor, double lowerTranslation,
    double maxMotorForce, double motorSpeed, double upperTranslation);
}

#endif
