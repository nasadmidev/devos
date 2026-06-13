# Features
- [ ] Add some external upload service (profile picture uploading)
- [ ] Messages and notification with Redis
- [x] Make admin capable of delete visual publications
- [x] Answer provider
- [x] Document Doubt and Answer DTOS/Controller
- [x] Testing Doubt and Answer module
- [ ] Doubt e2e

# Fixes
1. Google OAuth with name parameter could be duplicated
-----
# Doubt e2e
- POST /
  - [x] 201: should create a doubt
  - [x] 401: should fail to create a doubt if unauthorized (no token)
  - [x] 400: should fail to create a doubt with invalid body (missing title or description)

- GET /all
  - [x] 200: should get all doubts
  - [x] 400: should fail if lastIndex is invalid
  - [x] 400: should fail if limit is not a number string
  - [x] 400: should fail if the dynamic select has not a valid values

- GET /:id
  - [x] 200: should get a single doubt by id with dynamic select
  - [x] 400: should fail if the id parameter is not a valid UUID

- PUT /:id
  - [x] 200: should update the doubt if requested by the author
  - [x] 404: should fail to update the doubt if requested by another user
  - [x] 404: should return not found if updating a non-existent doubt


- POST /:id/answers
  - [x] 201: should create an answer for a specific doubt
  - [x] 400: should fail to create an answer if body data is invalid
  - [x] 400: should return not found if the target doubt id does not exist

- PATCH /answers/:answerId/correct
  - [x] 200: should toggle correct status to true if requested by the doubt author
  - [x] 200: should toggle correct status to true if requested by an ADMIN
  - [x] 403: should fail to toggle correct status if requested by a user who is not the doubt author
  - [x] 404: should return not found if the answer id does not exist


- POST /answers/:answerId/comments
  - [x] 201: should create a comment inside a specific answer
  - [x] 404: should return not found if the answer id does not exist

- DELETE /answers/comments/:commentId
  - [x] 200: should delete the comment if requested by the comment author
  - [x] 200: should delete the comment if requested by an ADMIN
  - [x] 404: should fail to delete the comment if requested by another user

- DELETE /answers/:answerId
  - [x] 200: should delete the answer if requested by the answer author
  - [x] 200: should delete the answer if requested by the doubt author (moderation)
  - [x] 200: should delete the answer if requested by an ADMIN
  - [x] 403: should fail to delete the answer if requested by an intruder

- DELETE /:id
  - [x] 200: should delete the doubt if requested by the author
  - [x] 200: should delete the doubt if requested by an ADMIN
  - [x] 404: should fail to delete the doubt if requested by another user