class RemoveDecimalFromAddresses < ActiveRecord::Migration
  def self.up
    remove_column :addresses, :decimal
    remove_column :neighborhoods, :decimal
  end

  def self.down
    add_column :addresses, :decimal, :decimal, :precision => 15, :scale => 10
    add_column :neighborhoods, :decimal, :decimal, :precision => 15, :scale => 10
  end
end
