#ifndef B2WORLDJSBINDINGS_H
#define B2WORLDJSBINDINGS_H
#include <emscripten/bind.h>
#include <Box2D/Box2D.h>

using namespace emscripten;

namespace b2WorldJs {
  b2Body& CreateBody(b2World& world, const b2BodyDef* def) {
    b2Body* b = world.CreateBody(def);
    return *b;
  }
  void Step(b2World& world, float32 a, int32 b, int32 c) {
    b2Body *bp = world.GetBodyList();
    while(bp != NULL) {
      printf("%f %f\n", bp->GetPosition().x, bp->GetPosition().y);
      b2Fixture* fp = bp->GetFixtureList();
      while(fp != NULL) {
        printf("FIx D %f\n", fp->GetDensity());
        fp = fp->GetNext();
      }

      bp = bp->GetNext();
    }
    world.Step(a, b, c);
  }
};

EMSCRIPTEN_BINDINGS(b2World) {

  class_<b2World>("b2World")
      .constructor<b2Vec2>()
      .function("CreateBody", &b2World::CreateBody, allow_raw_pointers())
     //.function("CreateBody", &b2WorldJs::CreateBody, allow_raw_pointers())
      .function("Step", &b2WorldJs::Step);
     //.function("Step", select_overload<void(float32, int32, int32)>(&b2World::Step));

}

#endif
