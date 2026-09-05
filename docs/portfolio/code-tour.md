# Five-minute AI engineering code tour

Start with the [evidence statuses](evidence.md). Public examples are synthetic, separately runnable programs, not the complete private backend or provider-connected static website.

| Time | Open | Inspect and explain |
|---|---|---|
| 0:00–0:50 | [Shortlist pipeline](../../examples/shortlist_ai/shortlist.py) | `build_context`: resolve compact IDs, reject ambiguous records, project allowed facts. Explain what the model never receives. |
| 0:50–1:35 | [Prompt and validation](../../examples/shortlist_ai/shortlist.py) | `build_request`, `validate_answer`, `explain`: separate instructions/data, exact output fields and citation membership; guardrails precede provider dispatch. Shape is not grounding. |
| 1:35–2:15 | [Provider adapter](../../examples/shortlist_ai/responses_provider.py) | `ResponsesProvider.complete`, `https_transport`, `translate_response`: fixed destination, explicit approved request identity, single attempt, refusal/incomplete handling and configured vs observed model. No live call is needed for this tour. |
| 2:15–3:15 | [MCP server](../../examples/mcp/server.py), [tool logic](../../examples/mcp/tool_logic.py), [independent client](../../examples/mcp/client.py) | `Session`, `validate_arguments`, `project_product`, `MCPClient`: protocol discovery and invocation, closed tool dispatch and data projection. An annotation is not an authorization boundary. |
| 3:15–4:00 | [Failure-path tests](../../examples/shortlist_ai/test_shortlist.py), [MCP tests](../../examples/mcp/tests/test_mcp.py) | Inspect invalid citations, hostile content, sanitized errors and real subprocess interoperability. Distinguish wire tests from model quality or hosted ChatGPT evidence. |
| 4:00–5:00 | [Evaluation harness](../../examples/evaluation/evaluate.py), [synthetic training](../../examples/ml_ranking/pipeline.py), [ML decision](responsible-ml.md), [ranking boundary](../../web/js/recommender_residual_shadow_demo.js) | Paired same-input evaluation with unfilled human/real-model measurements; frozen synthetic teacher imitation; historical negative ML result; public-showcase disable boundary and unchanged authoritative ordering. |

## Reproduce one proof

From the public repository root:

```bash
python3 examples/shortlist_ai/shortlist.py --scenario timeout
python3 examples/mcp/client.py
python3 examples/evaluation/evaluate.py
```

Expect a deterministic timeout fallback, a local MCP `PASS` with three discovered tools, and eight development contract rows. None is a real GPT-quality result. The ordinary Shortlist CLI is offline; the separate provider entrypoint prints a preview unless explicitly enabled following approval.

The tour's completion is measured by a fresh reviewer finding and explaining these boundaries, not by the presence of this document. New-candidate timed review remains pending.
