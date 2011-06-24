class Spot < ActiveRecord::Base
  has_many :addresses
  has_many :neighborhoods, :through => :addresses
end
