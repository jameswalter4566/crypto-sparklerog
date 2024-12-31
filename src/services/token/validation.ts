export interface TokenValidationConfig {
  name: string;
  symbol: string;
  description: string;
  image?: File;
  decimals?: number;
  initialSupply?: number;
}

export const validateTokenConfig = (config: TokenValidationConfig) => {
  if (!config.name || config.name.length < 2) {
    throw new Error("Token name must be at least 2 characters long");
  }

  if (!config.symbol || config.symbol.length < 2 || config.symbol.length > 10) {
    throw new Error("Token symbol must be between 2 and 10 characters");
  }

  if (!config.description || config.description.length < 10) {
    throw new Error("Token description must be at least 10 characters long");
  }

  if (config.decimals !== undefined && (config.decimals < 0 || config.decimals > 9)) {
    throw new Error("Token decimals must be between 0 and 9");
  }

  if (config.initialSupply !== undefined && config.initialSupply <= 0) {
    throw new Error("Initial supply must be greater than 0");
  }

  if (config.image) {
    validateTokenImage(config.image);
  }
};

export const validateTokenImage = (file: File) => {
  const MAX_SIZE = 1024 * 1024; // 1MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  if (file.size > MAX_SIZE) {
    throw new Error("Image file size must be less than 1MB");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Image must be JPEG, PNG, or GIF format");
  }
};