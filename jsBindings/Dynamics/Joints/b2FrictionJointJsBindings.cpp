#include<Box2D/Box2D.h>

// The creation function lives off of b2World, but we put it here for neatness
void* b2FrictionJointDef_CreateJoint(
    void* world,
    //joint def
    void* bodyA, void* bodyB, double collideConnected,
    // friction joint def
    double localAnchorAx, double localAnchorAy,
    double localAnchorBx, double localAnchorBy, double maxForce,
    double maxTorque) {
  b2FrictionJointDef def;
  def.bodyA = (b2Body*)bodyA;
  def.bodyB = (b2Body*)bodyB;
  def.collideConnected = (bool)collideConnected;
  def.localAnchorA = b2Vec2(localAnchorAx, localAnchorAy);
  def.localAnchorB = b2Vec2(localAnchorBx, localAnchorBy);
  def.maxForce = maxForce;
  def.maxTorque = maxTorque;

  return ((b2World*)world)->CreateJoint(&def);
}
