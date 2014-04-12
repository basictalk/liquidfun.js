#include <Box2D/Box2D.h>

void b2RevoluteJoint_InitializeAndCreate(void* world, void* bodyA, void* bodyB,
                              double anchorX, double anchorY,
                              //revoluteJointDef
                              double collideConnected, double enableLimit,
                              double enableMotor, double lowerAngle,
                              double maxMotorTorque, double motorSpeed,
                              double upperAngle, double userData) {
  b2RevoluteJointDef revJoint;
  revJoint.collideConnected = collideConnected;
  revJoint.enableLimit = enableLimit;
  revJoint.enableMotor = enableMotor;
  revJoint.lowerAngle = lowerAngle;
  revJoint.maxMotorTorque = maxMotorTorque;
  revJoint.motorSpeed = motorSpeed;
  revJoint.type = e_revoluteJoint;
  revJoint.upperAngle = upperAngle;
  revJoint.userData = (double*)&userData;

  revJoint.Initialize((b2Body*)bodyA, (b2Body*)bodyB, b2Vec2(anchorX, anchorY));
  ((b2World*)world)->CreateJoint(&revJoint);
}
