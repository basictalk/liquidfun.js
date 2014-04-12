#ifndef B2SHAPEJSBINDINGS_H
#define B2SHAPEJSBINDINGS_H

extern "C" {
float b2Shape_GetType(void* shape);
void b2Shape_SetRadius(void* shape, float radius);
}

#endif
