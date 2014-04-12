#ifndef B2FIXTUREJSBINDINGS_H
#define B2FIXTUREJSBINDINGS_H

extern "C" {
// b2FixtureDef exports
void* b2FixtureDef_Create();
void b2FixtureDef_Delete(void* fixtureDef);
float b2FixtureDef_GetDensity(void* fixtureDef);
float b2FixtureDef_GetFriction(void* fixtureDef);
float b2FixtureDef_GetRestitution(void* fixtureDef);
void* b2FixtureDef_GetShape(void* fixtureDef);
void b2FixtureDef_SetDensity(void* fixtureDef, float density);
void b2FixtureDef_SetFriction(void* fixtureDef, float friction);
void b2FixtureDef_SetRestitution(void* fixtureDef, float restitution);
void b2FixtureDef_SetShape(void* fixtureDef, void* shape);

//b2Fixture exports
void* b2Fixture_GetNext(void* fixture);
void* b2Fixture_GetShape(void* fixture);
}

#endif
