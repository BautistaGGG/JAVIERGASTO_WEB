const skipCheck = String(process.env.SKIP_NODE_VERSION_CHECK || '').toLowerCase() === 'true';

if (skipCheck) {
  console.warn('[node-check] SKIP_NODE_VERSION_CHECK=true, check omitted.');
  process.exit(0);
}

const parseVersion = (value) => {
  const [major, minor, patch] = String(value).split('.').map((part) => Number(part || 0));
  return { major, minor, patch };
};

const isSupportedVersion = ({ major, minor }) => {
  const is20Supported = major === 20 && minor >= 19;
  const is22PlusSupported = major > 22 || (major === 22 && minor >= 12);
  return is20Supported || is22PlusSupported;
};

const current = parseVersion(process.versions.node);

if (!isSupportedVersion(current)) {
  console.error(
    `[node-check] Node ${process.versions.node} is not supported. Required: ^20.19.0 || >=22.12.0`
  );
  process.exit(1);
}

console.log(`[node-check] Node ${process.versions.node} OK`);

