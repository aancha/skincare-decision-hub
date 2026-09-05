# Unfamiliar-review protocol

## Fresh-context agent review

Give two separate fresh-context reviewers only the proposed public checkout or approved public URL, with no project explanation. Ask them to record observed time and evidence:

1. Within 45 seconds: what is the product, who built it, and how do GPT, MCP and ML differ?
2. Within three minutes: follow the guided demonstration and explain which behavior is local, mocked, recorded or live.
3. Within ten minutes: reproduce one offline AI/MCP example and locate its validation logic.
4. Explain the failed ML promotion result, remaining evidence limits and whether any claim appears unsupported.

Record hesitation, dead links, unclear ownership, false assumptions, reproduction failures and safety confusion. Fix material findings, rerun affected tests and repeat the review as necessary. Do not infer timing from document length or report an unexecuted task as success.

## Ten-minute unfamiliar-human session — approval required

Before any contact or access-sharing, obtain approval for the exact participant and destination. Explain that the session tests portfolio clarity, not skincare or medical suitability. Obtain consent and separate recording consent if recording is proposed; default to brief written observations. Do not ask for medical history, credentials or unnecessary identity data.

- **0–1 min:** participant reads the repository front door and explains the product, ownership and AI components.
- **1–4 min:** participant follows the demonstration using fictional inputs, describing the context, tool call, fallback and ML boundary.
- **4–9 min:** participant follows the documented local command for one offline example and finds the validation code.
- **9–10 min:** participant identifies confusion, missing evidence and the next artifact they would inspect.

If paired explanation usefulness is evaluated in a separately approved session, use the [frozen rubric](../../examples/evaluation/rubric.json), blind source labels and randomize answer order. Do not mix browsing-comprehension results with explanation-quality scores.

## Minimal observation sheet

| Field | Record |
|---|---|
| Participant | Anonymous session ID only; no contact details in public artifacts |
| Consent | Scope approved; recording yes/no; agreed retention/deletion date |
| Candidate | Exact source/manifest identity and demo version |
| Environment | Runtime/browser and relevant setup barriers, without personal paths |
| Timing | Observed identification/demo/reproduction times or not completed |
| Findings | Task, observed behavior, impact, proposed correction |
| Outcome | Pass, fail, incomplete or not attempted; do not guess |

Retain only consented, anonymized observations and remove temporary recordings/material according to the approved retention plan. Publish no feedback without permission.

Fresh-context agents completed identification, offline reproduction and interpretation checks. Additional fresh reviewers inspected the completed replay's scene-final images and timeline; the requested visible validation rejection was added and rechecked. This is not continuous-playback or human validation. Fresh-context agent evaluation completed; unfamiliar-human validation pending. The packaged replay still requires playback acceptance and final publication checks.
