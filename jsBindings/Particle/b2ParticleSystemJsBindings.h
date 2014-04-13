#ifndef B2PARTICLESYSTEMJSBINDINGS
#define B2PARTICLESYSTEMJSBINDINGS
extern "C" {
double b2ParticleSystem_CreateParticle(void* particleSystem,
    //particleDef
    double colorR, double colorB, double colorG, double colorA,
    double flags, double group, double lifetime, double positionX,
    double positionY, double userData, double velocityX, double velocityY);

void* b2ParticleSystem_CreateParticleGroup_b2CircleShape(
    void* particleSystem,
    // ParticleGroupDef
    double angle, double angularVelocity, double colorR,
    double colorG, double colorB, double colorA, double flags, double group,
    double groupFlags, double lifetime, double linearVelocityX, double linearVelocityY,
    double positionX, double positionY, double positionData, double particleCount,
    double strength, double stride, double userData,
    // Circle
    double px, double py,
    double radius);

void* b2ParticleSystem_CreateParticleGroup_b2PolygonShape_4(
    void* particleSystem,
    // ParticleGroupDef
    double angle, double angularVelocity, double colorR,
    double colorG, double colorB, double colorA, double flags, double group,
    double groupFlags, double lifetime, double linearVelocityX, double linearVelocityY,
    double positionX, double positionY, double positionData, double particleCount,
    double strength, double stride, double userData,
    // shape
    double x0, double y0,
    double x1, double y1,
    double x2, double y2,
    double x3, double y3);

double b2ParticleSystem_GetParticleCount(void* particleSystem);

void b2ParticleSystem_GetPositionBuffer(void* particleSystem, float* arr);
}
#endif
