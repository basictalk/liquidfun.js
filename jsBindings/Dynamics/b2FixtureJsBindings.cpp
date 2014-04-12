#include <Box2D/Box2D.h>

// b2FixtureDef exports
void* b2FixtureDef_Create() {
  return new b2FixtureDef;
}
void b2FixtureDef_Delete(void* fixtureDef) {
  delete (b2FixtureDef*)fixtureDef;
}

float b2FixtureDef_GetDensity(void* fixtureDef) {
  return ((b2FixtureDef*)fixtureDef)->density;
}

float b2FixtureDef_GetFriction(void* fixtureDef) {
  return ((b2FixtureDef*)fixtureDef)->friction;
}

float b2FixtureDef_GetRestitution(void* fixtureDef) {
  return ((b2FixtureDef*)fixtureDef)->restitution;
}

void* b2FixtureDef_GetShape(void* fixtureDef) {
  return (void*)&((b2FixtureDef*)fixtureDef)->shape;
}

void b2FixtureDef_SetFriction(void* fixtureDef, float friction) {
  ((b2FixtureDef*)fixtureDef)->friction = friction;
}

void b2FixtureDef_SetDensity(void* fixtureDef, float density) {
  ((b2FixtureDef*)fixtureDef)->density = density;
}

void b2FixtureDef_SetRestitution(void* fixtureDef, float restitution) {
  ((b2FixtureDef*)fixtureDef)->restitution = restitution;
}

void b2FixtureDef_SetShape(void* fixtureDef, void* shape) {
  ((b2FixtureDef*)fixtureDef)->shape = (b2Shape*)shape;
}

// b2Fixture exports
void* b2Fixture_GetNext(void* fixture) {
  return ((b2Fixture*)fixture)->GetNext();
}
void* b2Fixture_GetShape(void* fixture) {
  return ((b2Fixture*)fixture)->GetShape();
}
