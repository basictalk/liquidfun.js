#ifndef B2MATHJSBINDINGS_H
#define B2MATHJSBINDINGS_H

extern "C" {
// b2Vec2 functions
void* b2Vec2_Create(float x, float y);
void b2Vec2_Delete(void* v);
float b2Vec2_GetX(void* v);
float b2Vec2_GetY(void* v);

}

#endif
