Todo List
==================

  - Separate application and display logic
    - Pros:
      - React idiomatic: better separation of concerns
    - Cons:
      - Other than for input validation and websocket handling there is very little logic in this webapp at all--the heavy lifting is done in kaly2
    - Verdict:
      - Only refactor this if planning on adding significantly more functionality
  - Use Redux or Flux for broadcasting messages recieved from the websocket
    - Pros: 
      - Simplified separation of display and application logic?
      - More explicit component state management?
    - Cons: 
      - heavier runtime, more initial boilerplate
    - Verdict: 
      - Probably worth trying out when refactoring to separate application and display logic
  - Improve resuming robot simulation after browser unsuspension
  - Use protobufs, or a competitor, to minimize websocket connection bandwidth and specify message contracts?
  - RxJS might make things simpler in some places
