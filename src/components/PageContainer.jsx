import styled from 'styled-components';
import { motion } from 'framer-motion';
import { gradients } from '../theme.js';

// Κοινός container με props `alignTop` και `noBg`
const PageContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ alignTop }) => (alignTop ? 'flex-start' : 'center')};
  /* Was 90vh — forced a tall reservation even for short pages, which left a
     visible gap between content and the new Footer. 40vh keeps a minimum
     breathing area without padding short pages out artificially. */
  min-height: 40vh;
  padding: 2rem 2rem 1.5rem 2rem;
  text-align: center;
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  background: ${({ noBg }) => (noBg ? 'transparent' : gradients.pageBg)};

  @media (max-width: 480px) {
    padding: 1.5rem 1rem 1rem 1rem;
  }
`;

export default PageContainer;
