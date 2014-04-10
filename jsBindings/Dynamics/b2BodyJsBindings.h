#ifndef B2BODYJSBINDINGS_H
#define B2BODYJSBINDINGS_H

extern "C" {
// b2BodyDef exports
void* b2BodyDef_Create();
void b2BodyDef_Delete(void* def);
void b2BodyDef_SetPosition(void* b, float x, float y);
void b2BodyDef_SetType(void* def, float type);

// b2Body exports
float b2Body_GetAngle(void* body);
void* b2Body_GetPosition(void* body);
void* b2Body_CreateFixture_b2BodyDef(void* body, void* def);
void* b2Body_CreateFixture_b2Shape(void* body, void* shape, float density);
}
#endif
