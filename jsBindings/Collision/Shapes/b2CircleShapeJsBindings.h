#ifndef B2CIRCLESHAPE
#define B2CIRCLESHAPE

extern "C" {
void* b2CircleShape_Create();
void b2CircleShape_Delete(void* circle);
void b2CircleShape_SetPosition(void* circle, float x, float y);
}

#endif
