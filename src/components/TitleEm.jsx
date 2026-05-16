import styled from "styled-components";

// Italic gold accent for the focal word inside a content-page heading.
// Mirrors the Episodes "Sol's *Episodes*" / "Τα επεισόδια της *Sol*" treatment.
// EN: accent on the content noun. EL: accent on "Sol" in the «X της Sol» genitive
// (focal/emphatic position in Greek syntax).
const TitleEm = styled.em`
  font-style: italic;
  color: var(--sol-sun);
  font-weight: inherit;
`;

export default TitleEm;
