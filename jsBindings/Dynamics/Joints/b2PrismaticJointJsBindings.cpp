#include <Box2D/Box2D.h>
void* b2PrismaticJointDef_Create(
    void* world,
    // joint def
    void* bodyA, void* bodyB, double collideConnected,
    // prismatic joint def
    double enableLimit, double enableMotor, double localAnchorAx,
    double localAnchorAy, double localAnchorBx, double localAnchorBy,
    double localAxisAx, double localAxisAy, double lowerTranslation,
    double maxMotorForce, double motorSpeed, double referenceAngle,
    double upperTranslation) {
  b2PrismaticJointDef def;
  def.bodyA = (b2Body*)bodyA;
  def.bodyB = (b2Body*)bodyB;
  def.collideConnected = collideConnected;

  def.enableLimit = enableLimit;
  def.enableMotor = enableMotor;
  def.localAnchorA = b2Vec2(localAnchorAx, localAnchorAy);
  def.localAnchorB = b2Vec2(localAnchorBx, localAnchorBy);
  def.localAxisA = b2Vec2(localAxisAx, localAxisAy);
  def.lowerTranslation = lowerTranslation;
  def.maxMotorForce = maxMotorForce;
  def.motorSpeed = motorSpeed;
  def.referenceAngle = referenceAngle;
  def.upperTranslation = upperTranslation;

  return ((b2World*)world)->CreateJoint(&def);
}

void* b2PrismaticJointDef_InitializeAndCreate(
    void* world,
    void* bodyA, void* bodyB, double anchorX,
    double anchorY, double axisX,  double axisY,
    //joint def
    double collideConnected,
    //prismatic joint def
    double enableLimit, double enableMotor, double lowerTranslation,
    double maxMotorForce, double motorSpeed, double upperTranslation) {
  b2PrismaticJointDef def;
  def.collideConnected = collideConnected;

  def.enableLimit = enableLimit;
  def.enableMotor = enableMotor;
  def.lowerTranslation = lowerTranslation;
  def.maxMotorForce = maxMotorForce;
  def.motorSpeed = motorSpeed;
  def.upperTranslation = upperTranslation;

  def.Initialize((b2Body*)bodyA, (b2Body*)bodyB, b2Vec2(anchorX, anchorY),
                 b2Vec2(axisX, axisY));
  return ((b2World*)world)->CreateJoint(&def);
}
