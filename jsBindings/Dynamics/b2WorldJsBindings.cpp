#include <Box2D/Box2D.h>

// b2World Exports
void* b2World_Create(double x, double y) {
  return new b2World(b2Vec2(x, y));
}

void* b2World_CreateBody(void* world, double active, double allowSleep,
                         double angle, double angularVelocity,
                         double angularDamping, double awake,
                         double bullet, double fixedRotation,
                         double gravityScale, double linearDamping,
                         double linearVelocityX, double linearVelocityY,
                         double positionX, double positionY, double type,
                         double userData) {
  b2BodyDef def;
  def.active = active;
  def.allowSleep = allowSleep;
  def.angle = angle;
  def.angularVelocity = angularVelocity;
  def.angularDamping = angularDamping;
  def.awake = awake;
  def.bullet = bullet;
  def.fixedRotation = fixedRotation;
  def.gravityScale = gravityScale;
  def.linearDamping = linearDamping;
  def.linearVelocity.Set(linearVelocityX, linearVelocityY);
  def.position.Set(positionX, positionY);
  def.type = (b2BodyType)type;
  def.userData = (void*)&userData;
  return ((b2World*)world)->CreateBody(&def);
}

void b2World_Delete(void* world) {
  delete (b2World*)world;
}

void* b2World_GetBodyList(void* world) {
  return ((b2World*)world)->GetBodyList();
}

void b2World_SetGravity(void* world, double x, double y) {
  ((b2World*)world)->SetGravity(b2Vec2(x, y));
}

void b2World_Step(void* world, float step, float vIterations, float pIterations) {

  ((b2World*)world)->Step(step, (int32)vIterations, (int32)pIterations);
}
