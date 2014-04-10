#ifndef B2WORLDJSBINDINGS_H
#define B2WORLDJSBINDINGS_H

extern "C" {

//b2World functions
void b2World_Step(void* world, float step, float vIterations, float pIterations);
void* b2World_CreateBody(void* world, void* def);
void* b2World_Create(void* gravity);
void b2World_Delete(void* world);


}

#endif
