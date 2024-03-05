const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/:formId/filteredResponses", async (req, res) => {
  try {
    const formId = req.params.formId;
    const apiKey =
      "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";

    // Extract filters from the query parameters
    const filters = JSON.parse(req.query.filters);

    // Fetch responses from Fillout.com's API
    const filloutApiResponse = await axios.get(
      `https://api.fillout.com/v1/api/forms/${formId}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Filter responses based on the provided filters
    const filteredResponses = filterResponses(
      filloutApiResponse.data.responses,
      filters
    );

    // Prepare and send the response
    const response = {
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount: 1, // Assuming no pagination for this assignment
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to filter responses based on the provided filters
function filterResponses(responses, filters) {
  return responses.filter((response) => {
    return filters.every((filter) => {
      const question = response.questions.find((q) => q.id === filter.id);
      if (!question) return false;

      let valueA = question.value;
      let valueB = filter.value;

      switch (question.type) {
        case "NumberInput":
          valueA = Number(question.value);
          valueB = Number(filter.value);
          break;
        case "DatePicker":
          valueA = new Date(question.value).getTime();
          valueB = new Date(filter.value).getTime();
          break;
        case "LongAnswer":
        case "ShortAnswer":
        case "MultipleChoice":
        case "EmailInput":
        default:
          valueA = question.value;
          valueB = filter.value;
          break;
      }

      switch (filter.condition) {
        case "equals":
          return valueA === valueB;
        case "does_not_equal":
          return valueA !== valueB;
        case "greater_than":
          return valueA > valueB;
        case "less_than":
          return valueA < valueB;
        default:
          return false;
      }
    });
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
