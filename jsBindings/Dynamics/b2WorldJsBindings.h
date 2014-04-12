#ifndef B2WORLDJSBINDINGS_H
#define B2WORLDJSBINDINGS_H

extern "C" {
//b2World functions
void* b2World_Create(double x, double y);
void* b2World_CreateBody(void* world, double active, double allowSleep,
                         double angle, double angularVelocity,
                         double angularDamping, double awake,
                         double bullet, double fixedRotation,
                         double gravityScale, double linearDamping,
                         double linearVelocityX, double linearVelocityY,
                         double positionX, double positionY, double type,
                         double userData);
void b2World_Delete(void* world);
void* b2World_GetBodyList(void* world);
void b2World_SetGravity(void* world, double x, double y);
void b2World_Step(void* world, float step, float vIterations, float pIterations);
}

#endif
