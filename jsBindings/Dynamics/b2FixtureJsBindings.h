#ifndef B2FIXTUREJSBINDINGS_H
#define B2FIXTUREJSBINDINGS_H

extern "C" {
// b2FixtureDef exports
void* b2FixtureDef_Create();
void b2FixtureDef_Delete(void* fixture);
float b2FixtureDef_GetDensity(void* fixture);
float b2FixtureDef_GetFriction(void* fixture);
float b2FixtureDef_GetRestitution(void* fixture);
void* b2FixtureDef_GetShape(void* fixture);
void b2FixtureDef_SetDensity(void* fixture, float density);
void b2FixtureDef_SetFriction(void* fixture, float friction);
void b2FixtureDef_SetRestitution(void* fixture, float restitution);
void b2FixtureDef_SetShape(void* fixture, void* shape);
}

#endif
