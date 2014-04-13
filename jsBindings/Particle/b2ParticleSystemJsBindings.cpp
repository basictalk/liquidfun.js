#include<Box2D/Box2D.h>
#include <stdio.h>
// TODO add setDamping, setRadius

double b2ParticleSystem_CreateParticle(void* particleSystem,
    //particleDef
    double colorR, double colorB, double colorG, double colorA,
    double flags, double group, double lifetime, double positionX,
    double positionY, double userData, double velocityX, double velocityY) {
  b2ParticleDef def;
  def.color = b2ParticleColor(colorR, colorG, colorB, colorA);
  def.flags = flags;
  def.group = (b2ParticleGroup*)&group;
  def.lifetime = lifetime;
  def.position = b2Vec2(positionX, positionY);
  def.userData = (double*)&userData;
  def.velocity = b2Vec2(velocityX, velocityY);

  return ((b2ParticleSystem*)particleSystem)->CreateParticle(def);
}

// Shapes array is not currently supported for b2ParticleSystems
// Create from circle
void* b2ParticleSystem_CreateParticleGroup_b2CircleShape(
    void* particleSystem,
    // ParticleGroupDef
    double angle, double angularVelocity, double colorR,
    double colorG, double colorB, double colorA, double flags, double group,
    double groupFlags, double lifetime, double linearVelocityX, double linearVelocityY,
    double positionX, double positionY, double positionData, double particleCount,
    double strength, double stride, double userData,
    // Circle
    double px, double py,
    double radius) {
  b2ParticleGroupDef def;
  def.angle = angle;
  def.angularVelocity = angularVelocity;
  def.color = b2ParticleColor(colorR, colorG, colorB, colorA);
  def.flags = flags;
  def.group = NULL;
  def.groupFlags = groupFlags;
  def.lifetime = lifetime;
  def.linearVelocity = b2Vec2(linearVelocityX, linearVelocityY);
  def.position = b2Vec2(positionX, positionY);
  def.positionData = NULL;
  def.particleCount = particleCount;
  def.shapeCount = 0;
  def.shapes = NULL;
  def.strength = strength;
  def.stride = stride;
  def.userData = (double*)&userData;

  b2CircleShape c;
  c.m_p = b2Vec2(px, py);
  c.m_radius = radius;

  def.shape = &c;

  return ((b2ParticleSystem*)particleSystem)->CreateParticleGroup(def);
}

// Create b2ParticleSystem from 4 sided polygon

void* b2ParticleSystem_CreateParticleGroup_b2PolygonShape_4(
    void* particleSystem,
    // ParticleGroupDef
    double angle, double angularVelocity, double colorR,
    double colorG, double colorB, double colorA, double flags, double group,
    double groupFlags, double lifetime, double linearVelocityX, double linearVelocityY,
    double positionX, double positionY, double positionData, double particleCount,
    double strength, double stride, double userData,
    // shape
    double x0, double y0,
    double x1, double y1,
    double x2, double y2,
    double x3, double y3) {
  b2ParticleGroupDef def;
  def.angle = angle;
  def.angularVelocity = angularVelocity;
  def.color = b2ParticleColor(colorR, colorG, colorB, colorA);
  def.flags = flags;
  def.group = NULL;
  def.groupFlags = groupFlags;
  def.lifetime = lifetime;
  def.linearVelocity = b2Vec2(linearVelocityX, linearVelocityY);
  def.position = b2Vec2(positionX, positionY);
  def.positionData = NULL;
  def.particleCount = particleCount;
  def.shapeCount = 0;
  def.shapes = NULL;
  def.strength = strength;
  def.stride = stride;
  def.userData = (double*)&userData;

  //printf("%f %f %d %d\n", flags, groupFlags, def.flags, def.groupFlags);

  const int count = 4;
  b2Vec2 points[count] = {
      b2Vec2(x0, y0),
      b2Vec2(x1, y1),
      b2Vec2(x2, y2),
      b2Vec2(x3, y3)
  };


  b2PolygonShape p;
  p.Set(points, count);
  def.shape = &p;

 // ((b2ParticleSystem*)particleSystem)->SetGravityScale(0.4f);
  //((b2ParticleSystem*)particleSystem)->SetDensity(1.2f);
  //b2PolygonShape shape;
  //shape.SetAsBox(1, 0.5f);
 // b2ParticleGroupDef def;
  //def.flags = b2_springParticle;
 // def.groupFlags = b2_solidParticleGroup;
  //def.position.Set(1, 4);
  //def.angle = -0.5f;
  //def.angularVelocity = 2.0f;
  //def.shape = &shape;
  //def.color.Set(0, 0, 255, 255);
  //m_particleSystem->CreateParticleGroup(pd);

  return ((b2ParticleSystem*)particleSystem)->CreateParticleGroup(def);
}

double b2ParticleSystem_GetParticleCount(void* particleSystem) {
  return ((b2ParticleSystem*)particleSystem)->GetParticleCount();
}

void b2ParticleSystem_GetPositionBuffer(void* particleSystem, float* arr) {
  int32 count = ((b2ParticleSystem*)particleSystem)->GetParticleCount();
  b2Vec2* buffer = ((b2ParticleSystem*)particleSystem)->GetPositionBuffer();

  for (int i = 0, j = 0; i < 2 * count; i += 2, j++) {
    arr[i] = buffer[j].x;
    arr[i+1] = buffer[j].y;
  }
}
