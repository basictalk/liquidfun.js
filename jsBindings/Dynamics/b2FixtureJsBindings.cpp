#include <Box2D/Box2D.h>

void* b2FixtureDef_Create() {
  return new b2FixtureDef;
}
void b2FixtureDef_Delete(void* fixture) {
  delete (b2FixtureDef*)fixture;
}

float b2FixtureDef_GetDensity(void* fixture) {
  return ((b2FixtureDef*)fixture)->density;
}

float b2FixtureDef_GetFriction(void* fixture) {
  return ((b2FixtureDef*)fixture)->friction;
}

float b2FixtureDef_GetRestitution(void* fixture) {
  return ((b2FixtureDef*)fixture)->restitution;
}

void* b2FixtureDef_GetShape(void* fixture) {
  return (void*)&((b2FixtureDef*)fixture)->shape;
}

void b2FixtureDef_SetFriction(void* fixture, float friction) {
  ((b2FixtureDef*)fixture)->friction = friction;
}

void b2FixtureDef_SetDensity(void* fixture, float density) {
  ((b2FixtureDef*)fixture)->density = density;
}

void b2FixtureDef_SetRestitution(void* fixture, float restitution) {
  ((b2FixtureDef*)fixture)->restitution = restitution;
}

void b2FixtureDef_SetShape(void* fixture, void* shape) {
  ((b2FixtureDef*)fixture)->shape = (b2Shape*)shape;
}
