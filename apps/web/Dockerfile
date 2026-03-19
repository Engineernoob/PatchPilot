FROM node:20-alpine

WORKDIR /workspace

COPY package.json tsconfig.base.json /workspace/
COPY apps/web/package.json /workspace/apps/web/package.json
COPY packages/shared/package.json /workspace/packages/shared/package.json
COPY packages/evals/package.json /workspace/packages/evals/package.json
COPY packages/prompts/package.json /workspace/packages/prompts/package.json
COPY packages/parsers/package.json /workspace/packages/parsers/package.json

RUN npm install

COPY apps/web /workspace/apps/web
COPY packages/shared /workspace/packages/shared
COPY packages/evals /workspace/packages/evals
COPY packages/prompts /workspace/packages/prompts
COPY packages/parsers /workspace/packages/parsers

CMD ["npm", "run", "dev", "--workspace", "@patchpilot/web", "--", "--hostname", "0.0.0.0", "--port", "3000"]
