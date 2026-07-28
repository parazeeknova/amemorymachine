package handlers

import (
	"testing"
)

func TestEncryptDecrypt(t *testing.T) {
	token := "ghp_test123456789012345678901234567890"

	encrypted, err := encryptToken(token)
	if err != nil {
		t.Fatalf("encryptToken failed: %v", err)
	}

	if len(encrypted) == 0 {
		t.Fatal("encrypted token is empty")
	}

	decrypted, err := decryptToken(encrypted)
	if err != nil {
		t.Fatalf("decryptToken failed: %v", err)
	}

	if decrypted != token {
		t.Errorf("decrypted token mismatch: got %q, want %q", decrypted, token)
	}
}

func TestEncryptDecryptEmptyString(t *testing.T) {
	encrypted, err := encryptToken("")
	if err != nil {
		t.Fatalf("encryptToken failed: %v", err)
	}

	decrypted, err := decryptToken(encrypted)
	if err != nil {
		t.Fatalf("decryptToken failed: %v", err)
	}

	if decrypted != "" {
		t.Errorf("expected empty string, got %q", decrypted)
	}
}

func TestDecryptCorruptedData(t *testing.T) {
	_, err := decryptToken([]byte("not-valid-encrypted-data"))
	if err == nil {
		t.Fatal("expected error decrypting corrupted data")
	}
}
