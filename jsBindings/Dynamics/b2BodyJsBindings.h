#ifndef B2BODYJSBINDINGS_H
#define B2BODYJSBINDINGS_H

extern "C" {
// b2Body exports
void b2Body_ApplyForce(void* body, double forceX, double forceY,
                       double pointX, double pointY, double wake);
void b2Body_ApplyTorque(void* body, double force, double wake);
double b2Body_GetAngle(void* body);
double b2Body_GetInertia(void* body);
double b2Body_GetMass(void* body);
void b2Body_GetPosition(void* body, float* arr);
void b2Body_GetTransform(void* body, float* arr);
void b2Body_GetWorldPoint(void* body, double pointX, double pointY, float* arr);
void b2Body_GetWorldVector(void* body, double vX, double vY, float* arr);
void b2Body_SetAngularVelocity(void* body, double angle);
void b2Body_SetLinearVelocity(void* body, double x, double y);
void b2Body_SetTransform(void* body, double x, double y, double angle);
}
#endif
