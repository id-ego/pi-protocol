# References

Official external documentation reference books for this project.

## Books

| Library | DB | Version | Source | Notes |
|---|---|---|---|---|
| npm | npm.sqlite | current | https://github.com/npm/documentation | Selected official npm docs for package metadata, scoped public packages, tokens, and publishing. |
| gitlab-ci | gitlab-ci.sqlite | current | https://gitlab.com/gitlab-org/gitlab/-/tree/master/doc/ci | Selected official GitLab CI/CD docs for rules, variables, tags, and pipelines. |

## Usage

```bash
bnote search --db docs/refs/<library>.sqlite "<query>" --top-k 5
bnote context --db docs/refs/<library>.sqlite "<query>"
bnote show --db docs/refs/<library>.sqlite "<title>"
```
