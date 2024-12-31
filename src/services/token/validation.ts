export interface TokenValidationConfig {
  name: string;
  symbol: string;
  description: string;
  image?: File;
  decimals?: number;
  initialSupply?: number;
}

export function validateTokenConfig(config: TokenValidationConfig): void {
  if (!config.name || config.name.trim().length === 0) {
    throw new Error("Token name is required");
  }

  if (!config.symbol || config.symbol.trim().length === 0) {
    throw new Error("Token symbol is required");
  }

  if (!config.description || config.description.trim().length === 0) {
    throw new Error("Token description is required");
  }

  if (config.decimals !== undefined) {
    if (config.decimals < 0 || config.decimals > 9) {
      throw new Error("Decimals must be between 0 and 9");
    }
  }

  if (config.image) {
    validateImageFile(config.image);
  }
}

function validateImageFile(file: File): void {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  if (file.size > MAX_SIZE) {
    throw new Error("Image file size must be less than 5MB");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Image must be in JPEG, PNG, or GIF format");
  }
}