@wi-040 @playwright @cucumber @privacy
Feature: Expanded MVP UAT evidence
  The expanded MVP must run locally with durable execution evidence,
  browser-visible application flow, and no canonical vault mutation.

  Background:
    Given the Vitae API is reachable
    And the frontend is reachable
    And the canonical vault baseline is captured

  Scenario: Expanded MVP fixture exposes the required runtime shape
    When I request the expanded MVP UAT contract
    Then at least two applications are present
    And required Temporal workflow types are advertised
    And the Book of Work refresh reports no canonical vault mutation

  Scenario Outline: Required RuntimeExecution workflow types can start safely
    When I start a runtime execution for "<workflowType>"
    Then the runtime execution is accepted for "<workflowType>"
    And the public runtime response contains no private Temporal payload fields

    Examples:
      | workflowType             |
      | book-of-work-refresh     |
      | curation                 |
      | target-catalog-fit       |
      | deliverable-generation   |
      | application-automation   |

  Scenario: Human decision and cancellation use opaque RuntimeExecution APIs
    When I start a runtime execution for "curation"
    And I approve the runtime execution
    Then the runtime execution is completed
    When I start a runtime execution for "application-automation"
    And I cancel the runtime execution
    Then the runtime execution is cancelled

  Scenario: Browser job-fit path works with synthetic UAT material
    When I complete the browser job-fit flow with synthetic material
    Then the browser shows job-fit results
    And no browser-visible error includes synthetic private source text

  Scenario: Temporal history remains opaque
    Given a Temporal history export path is configured
    When I inspect the Temporal history export
    Then the Temporal history contains no forbidden UAT evidence

  Scenario: canonical vault remains unchanged
    When I capture the canonical vault final inventory
    Then the canonical vault inventory is unchanged
