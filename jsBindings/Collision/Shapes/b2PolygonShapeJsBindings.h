#ifndef B2POLYGONSHAPEJSBINDINGS_H
#define B2POLYGONSHAPEJSBINDINGS_H

extern "C" {
//b2PolygonShape exports
void* b2PolygonShape_Create();
void b2PolygonShape_Delete(void* polygon);
void* b2PolygonShape_GetCentroid(void* polygon);
void b2PolygonShape_SetAsBox_xy(void* polygon, float x, float y);
}

#endif
